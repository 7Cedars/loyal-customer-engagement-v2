"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient, publicClient } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints, Status } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { usePrivyWagmi } from "@privy-io/wagmi"
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, getSenderAddress, parseAccount, signUserOperationHashWithECDSA, UserOperation, walletClientToSmartAccountSigner } from "permissionless"
import { signerToSimpleSmartAccount } from "permissionless/accounts"
import { useEffect, useRef, useState } from "react"
import { Abi, Account, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex, http } from "viem"
import { SmartAccount, toPackedUserOperation } from "viem/account-abstraction"
import { foundry } from "viem/chains"
import { useReadContract, useReadContracts, useSignTypedData, useWalletClient } from "wagmi"
import { SignTypedDataData } from "wagmi/query"

// 
// 
// 
/**
 * NB! READ THE BELOW FIRST BEFORE EDITING! 
 * 
 * The problem I am facing is that the userOp object is different in permissionless than it is in the contract. 
 * - the contract has an initcode item. 
 * - permissionless has a factory and factoryData item. -- this ALSO reflects in their UserOperation<0.7> type! 
 * - if you send UserOperation<0.7> object to getHashUserOp function in entryPoint contract: you get _nothing_ back. 
 * - meanwhile, if you do not use UserOperation<0.7> object to send item to bundler, bundler will protest. 
 * This has nothing to do wth versions. The AA I am using at solidity side is version 0.7, and so is permissionless. It all just seems to come down to choices made by the pimlico team.  
 * Possible solution: It seems that the initcode is the combination of factory + factoryData. This would mean that the 'toPackedUserOperation' ends up with the exact same object as sendUserOperation
 * Using toPackedUserOperation to get the hash and signature; and using the original object to send to bundler... should work. But it all depends on these functions doing 100% the same thing!  
 * 
 * NB! READ THE ABOVE  FIRST BEFORE EDITING! 
 * 
 * NB: The rest is old: 
 * 
 * What this hook needs to do: 
 * have function: sendUserOp, takes data for function data (abi, functionName, args)
 * When function is called: 
 * 1: create functionData (function to be executed)
 * 2: create executeData (the call to execute in LoyaltyCard that will execute function Data)
 * 3: create packed userOp. 
 * 4: sign packed userOp - this will ask use for confirmation. 
 * 5: send signed userOp to bundlerClient. 
 */

// import here. 

// follow with test in foundry, refactor to react / next / wagmi -- interesting. 


// bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.requestPointsAndCard.selector, program, points, uniqueNumber, signature, ownerCard);
// bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

type EncodeRequestPointsAndCardProps = { 
  program: Hex;
  points: bigint;  
  uniqueNumber: bigint;  
  signature: Hex; 
}

type PackedUserOperation = {
    sender: Hex;
    nonce: bigint;
    initCode: Hex;
    callData: Hex;
    accountGasLimits: Hex; // length32
    preVerificationGas: bigint;
    gasFees: Hex; //length32);
    paymasterAndData: Hex;
    signature: Hex;
}

type sendUserOpProps = { 
  abi: Abi;
  functionName: string;  
  args: Array<bigint | string | Hex >; 
}

const types = {
  userOpHash: [
    { name: 'digest', type: 'bytes32' }
  ],
} as const

type gasPriceProps = {
  slow: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
};
  standard: {
      maxFeePerGas: bigint;
      maxPriorityFeePerGas: bigint;
  };
  fast: {
      maxFeePerGas: bigint;
      maxPriorityFeePerGas: bigint;
  };
}

export const useSendUserOp = () => { // here types can be added: "exchangePoints", etc 
  const addressNonce  = useRef<bigint>(0n)
  const functionData = useRef<Hex>('0x0')
  const executeCallData = useRef<Hex>('0x0')
  const [status, setStatus] = useState<Status>('isIdle'); 
  
  const [packedUserOp, setPackedUserOp] = useState<UserOperation<"v0.7">>()
  const preVerificationGas: bigint = 247487n
  const verificationGasLimit: bigint = 526114n
  const callGasLimit: bigint = 75900n

  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  const {
    data: walletClient
  } = useWalletClient()
  
  const gasPrice = useRef<gasPriceProps>({
          slow: {
              maxFeePerGas: 0n,
              maxPriorityFeePerGas: 0n
          },
            standard: {
                maxFeePerGas: 0n,
                maxPriorityFeePerGas: 0n,
            },
            fast: {
                maxFeePerGas: 0n,
                maxPriorityFeePerGas: 0n
            }}) 

  const {data: loyaltyCardAddress, status: statusLoyaltyCardAddress}  = useReadContract({
    abi: factoryCardsAbi,
    address: prog.cardsFactory,
    functionName: 'getAddress',
    args: [embeddedWallet?.address, prog.address, 42n] 
  }) 

  const entryPointContract = {
    abi: entryPointAbi,
    address: prog.entryPoint,
  } as const

  const {data, status: statusUserOpHash} = useReadContracts({
    contracts: [
        {
          ...entryPointContract,
          functionName: 'getNonce',
          args: [
            loyaltyCardAddress,
            42n
          ]
        },
        {
          ...entryPointContract,
          functionName: 'getUserOpHash',
          args: [packedUserOp]
        }
      ]
  })

  useEffect(() => {
    const fetchGasPrice = async() => {
      try {
        const fetchedGasPrice: gasPriceProps = await bundlerClient.getUserOperationGasPrice() 
        gasPrice.current = fetchedGasPrice
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    fetchGasPrice()
  })
  console.log("Fetched gasPrice from bundler:", gasPrice)


  const cardFactoryData = encodeFunctionData({
    abi: factoryCardsAbi,
    functionName: 'createAccount', 
    args: [
      embeddedWallet?.address,
      prog.address, 
      42n // salt
    ]
  })
  console.log(cardFactoryData) 

  
  addressNonce.current = data ? data[0].result as bigint : 0n

  const message = {
    digest: data ? data[1].result as Hex : '0x'
  } as const
  const { data: signature, isPending, isError, isSuccess, signTypedData, reset, failureReason } = useSignTypedData()

  console.log({
    statusLoyaltyCardAddress: statusLoyaltyCardAddress, 
    loyaltyCardAddress: loyaltyCardAddress, 
    statusUserOpHash: statusUserOpHash,
    packedUSerOp: packedUserOp, 
    data: data, 
    userOpHash: data ? data[1].result as Hex : '0x', 
    addressNonce: data ? data[0].result as Hex : '0x', 
    signature: signature, 
    isSuccess: isSuccess, 
    isPending: isPending, 
    isError: isError,
    failureReason: failureReason
  })
  
  // this function does all the data prep. 
  const getPackedUserOp = ({abi, functionName, args}: sendUserOpProps) => {
    functionData.current = encodeFunctionData({
      abi: abi,
      functionName: functionName, 
      args: args // see args of requestPointsAndCard
    })
    console.log(functionData.current) 

    executeCallData.current = encodeFunctionData({
      abi: loyaltyCardAbi,
      functionName: 'execute', 
      args: [
        loyaltyCardAddress,
        0n,  
        embeddedWallet?.address
      ]
    })
    console.log("executeCallData.current: ", executeCallData.current) 

    const packedUserOpTemp = toPackedUserOperation({
      sender: parseEthAddress(loyaltyCardAddress), 
      nonce: addressNonce.current, 
      factory: prog.cardsFactory as Hex, // can I leave these out? 
      factoryData: cardFactoryData, // can I leave these out? 
      callData: executeCallData.current,
      maxFeePerGas: gasPrice.current.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.current.fast.maxPriorityFeePerGas,
      preVerificationGas,
      verificationGasLimit,
      callGasLimit,
      signature: '0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c' as Hex,
    } as UserOperation<"v0.7">) 
    // NB! the packedUserOpTemp object has the initCode item, and lacks the factory & factoryData items. 
    // NB! it seems that initcode is optional in PackedUserOperation.sol. 
    // maybe it is possible to circumvent the problem like this? 
    console.log("packedUserOpTemp: ", packedUserOpTemp)

    // setPackedUserOp(packedUserOpTemp) NB: this 
  }
  
  // This is the function that is called by the user. With it, the user actually _signs their message_. signing message actually triggers sending it.  
  const sendUserOp = async ({abi, functionName, args}: sendUserOpProps) => {
    console.log("sendUserOp called")
    getPackedUserOp({abi, functionName, args})

    // if (embeddedWallet && packedUserOp) {
    //   console.log("parseAccount(parseEthAddress(embeddedWallet.address)): ", parseAccount(parseEthAddress(embeddedWallet.address)))    

    //   try {
    //     console.log("signUserOperationHashWithECDSA called")
    //   const signature = await signUserOperationHashWithECDSA({
    //     account: localAccount, 
    //     userOperation: packedUserOp,
    //     chainId: 31337,
    //     entryPoint: ENTRYPOINT_ADDRESS_V07,
    //   })
    //   console.log("signUserOperationHashWithECDSA: ", signature)
    //   } catch (e) {
    //     console.log("error signUserOperationHashWithECDSA:", e)
    //   }
    // }
    
    // if (signature && isSuccess && embeddedWallet && packedUserOp && gasPrice.current) {
    //   try {
    //     const newSig = await signUserOperationHashWithECDSA({
    //       account: parseAccount(parseEthAddress(embeddedWallet?.address)),
    //       userOperation: packedUserOp,
    //       chainId: 31337,
    //       entryPoint: ENTRYPOINT_ADDRESS_V07,
    //     })
    //     console.log("new signature: ", newSig)
    //     setPackedUserOp({...packedUserOp, signature: newSig})
    //     // packedUserOp.signature = signature

    //   } catch (e) {
    //       console.error("ERROR in signUserOperationHashWithECDSA: ", e);
    //       return null;
    //     }

    //   }
    // }
    if (statusUserOpHash == 'success') {
      signTypedData({
        types, 
        primaryType: 'userOpHash',
        message  // = userOpHash, derived from packedUserOp. 
      })}
    }

  // when message is _signed_ it is send to the bundler. 
  useEffect(() => {
    if (signature && isSuccess && embeddedWallet && packedUserOp && gasPrice.current) {
      console.log("bundlerClient checks passed, going to be called. ")
      console.log("packedUserOp.signature: ", packedUserOp.signature)

      // const sendOp = async () => {
      //   try {
      //     const userOperationHash = await bundlerClient.sendUserOperation(
      //       {
      //         userOperation: {
      //             sender: packedUserOp.sender,
      //             nonce:  packedUserOp.nonce,
      //             factory: packedUserOp.factory, 
      //             factoryData:
      //                 "0xc5265d5d0000000000000000000000006723b44abeec4e71ebe3232bd5b455805badd22f0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e412af322c018104e3ad430ea6d354d013a6789fdfc71e671c4300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000014ec787ae5c34157ce61e751e54dff3612d4117663000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      //             callData:
      //                 "0xe9ae5c530100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000594bc666500faed35dc741f45a35c571399560d80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e4e688a440000000000000000000000000c67e4838d4e6682e3a5f9ec27f133e76cb3855f30000000000000000000000006152348912fb1e78c9037d83f9d4524d4a2988ed00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041aebdfb90adba067d9304980a300636506c3c9081b01f64b04f108407a890602377625ef9096946cc028743123646881c7e31a1c8d6698132c188cb4c33a3f9151b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      //             maxFeePerGas: 99985502n,
      //             maxPriorityFeePerGas: 1221000n,
      //             preVerificationGas: 66875n,
      //             verificationGasLimit: 373705n,
      //             callGasLimit: 170447n,
      //             paymaster: "0x9d0021A869f1Ed3a661Ffe8C9B41Ec6244261d98",
      //             paymasterData:
      //                 "0x000000000000000000000000000000000000000000000000000000006638ab470000000000000000000000000000000000000000000000000000000000000000e9311d1945317dc6a1c750e8e6d0641a598beb59edc5652ed3807ca57338a7a107123e1a479386b2c91f242d2dff367c18e0ad9d1021acfe47afc890e252644e1c",
      //             paymasterVerificationGasLimit: 20274n
      //             paymasterPostOpGasLimit: 1n,
      //             signature:
      //                 "0xa58d445f26b126fcd644975f0c66bd45f3e6e5b9c1acec2eeee490aa9341cfc312988231c228f84e12eac2d90ed9cd8825546d70d73b2e0fabdd6c8089ab29581b",
      //         },
      //         entryPoint: prog.entryPoint
      //     // {userOperation: packedUserOp, entryPoint: prog.entryPoint },
           
      //   )
      //     console.log("userOperationHash: ", userOperationHash)
      //   } catch (e) {
      //     console.error(e);
      //     return null;
      //   }
      // } 
      // sendOp() 
    }
  }, [signature, isSuccess, embeddedWallet, prog.cardsFactory, preVerificationGas, verificationGasLimit, callGasLimit, loyaltyCardAddress, cardFactoryData, gasPrice, packedUserOp, prog.entryPoint])

  return {sendUserOp, status} // note, for now no error handling, status updates, etc. That's for later.  
}



  // CONTINUE HERE. // 
  

  
  // console.log("userOpHash: ", userOpHash.data )


  // const encodeExecuteCallData = ({dest, value, functionData}: EncodeExecuteCallDataProps) => {
  //   const executeCallData = encodeFunctionData({
  //     abi: loyaltyCardAbi,
  //     functionName: 'execute', 
  //     args: [
  //       dest,
  //       value, // does this need to be Bigint? 
  //       functionData
  //     ]
  //   })
  //   return executeCallData
  // }

  // const createPackedUserOp = (executeCallData: Hex) => {
  //   // This is all still really iffy. Have to check some github repos that implement this. Pimlico? 


   
  // }

  // const handleSigningUserOp = () => {
  //   if (prog.address) {

    

  // }

  ///////////////////////// 
  // Executing functions // 
  /////////////////////////


  // console.log("resultReadContractFactory: ", loyaltyCard.)

  // const functionData = encodeRequestPointsAndCard({
  //   program: request.program ? request.program : '0x0000000000000000000000000000000000000000', 
  //   points: request.points, 
  //   uniqueNumber: request.uniqueNumber, 
  //   signature: request.signature ?  request.signature : '0x0'
  //   }); 
  // console.log("functionData: ", functionData)

  // const executeCallData = encodeExecuteCallData({
  //   dest: prog.address ? prog.address : '0x0', 
  //   value: 0,  

  //   functionData: functionData
  // })
  // console.log("executeCallData: ", executeCallData)

  // const packedUserOp = createPackedUserOp(executeCallData)
  // console.log("packedUserOp: ", packedUserOp)

  // const userOpHash = useReadContract({
  //   abi: entryPointAbi,
  //   address: prog.entryPoint,
  //   functionName: 'getUserOpHash',
  //   args: [packedUserOp]
  // }) 
  // console.log("userOpHash: ", userOpHash.data )


//   type EncodeExecuteCallDataProps = {
//     dest: Hex; 
//     value: number;
//     functionData: Hex;  
//   }
  
 


// } 


/// FOR REFERENCE // 

// ) internal pure returns (PackedUserOperation memory) {
//   uint256 verificationGasLimit = 16777216;
//   uint256 callGasLimit = verificationGasLimit;
//   uint256 maxPriorityFeePerGas = 256;
//   uint256 maxFeePerGas = maxPriorityFeePerGas;

//   return PackedUserOperation({
//     sender: sender,
//     nonce: nonce,
//     initCode: hex"",
//     callData:callData,
//     accountGasLimits: bytes32(uint256(verificationGasLimit) << 128 | callGasLimit),
//     preVerificationGas: verificationGasLimit,
//     gasFees: bytes32(uint256(maxPriorityFeePerGas) << 128 | maxFeePerGas),
//     paymasterAndData: hex"",
//     signature: hex""
// });


