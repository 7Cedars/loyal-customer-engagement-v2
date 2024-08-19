"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints, Status } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useEffect, useRef, useState } from "react"
import { Abi, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex } from "viem"
import { toPackedUserOperation } from "viem/account-abstraction"
import { useReadContract, useReadContracts, useSignTypedData } from "wagmi"
import { SignTypedDataData } from "wagmi/query"

// 
// 
// 
/**
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

export const useSendUserOp = () => { // here types can be added: "exchangePoints", etc 
  const addressNonce  = useRef<bigint>(0n)
  const functionData = useRef<Hex>('0x0')
  const executeCallData = useRef<Hex>('0x0')
  const cardFactoryData = useRef<Hex>('0x0')
  const [status, setStatus] = useState<Status>('isIdle'); 
  const [packedUserOp, setPackedUserOp] = useState<PackedUserOperation>({
    sender: '0x', 
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    accountGasLimits: '0x',
    preVerificationGas: 0n, 
    gasFees: '0x',
    paymasterAndData: '0x',
    signature: '0x'
  })
  const maxFeePerGas: bigint = 99985502n
  const maxPriorityFeePerGas: bigint = 1221000n
  const preVerificationGas: bigint = 6687500n
  const verificationGasLimit: bigint = 37370500n
  const callGasLimit: bigint = 17044700n

  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

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


  
  addressNonce.current = data ? data[0].result as bigint : 0n

  const message = {
    digest: data ? data[1].result as Hex : '0x'
  } as const
  const { data: signature, isPending, isError, isSuccess, signTypedData, reset, failureReason } = useSignTypedData()

  console.log({
    statusLoyaltyCardAddress: statusLoyaltyCardAddress, 
    loyaltyCardAddress: loyaltyCardAddress, 
    statusUserOpHash: statusUserOpHash,
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
    console.log(executeCallData.current) 

    cardFactoryData.current = encodeFunctionData({
      abi: factoryCardsAbi,
      functionName: 'createAccount', 
      args: [
        embeddedWallet?.address,
        prog.address, 
        42n // salt
      ]
    })
    console.log(cardFactoryData.current) 

    const packedUserOpTemp = toPackedUserOperation({
      sender: parseEthAddress(loyaltyCardAddress), // needs to be loyaltyCard. 
      nonce: addressNonce.current, 
      factory: prog.cardsFactory,
      factoryData: cardFactoryData.current, 
      callData: executeCallData.current,
      maxFeePerGas,
      maxPriorityFeePerGas,
      preVerificationGas,
      verificationGasLimit,
      callGasLimit,
      signature: '0x'
    })

    setPackedUserOp(packedUserOpTemp) 
  }
  
  // This is the function that is called by the user. With it, the user actually _signs their message_. signing message actually triggers sending it.  
  const sendUserOp = ({abi, functionName, args}: sendUserOpProps) => {
    console.log("sendUserOp called")
    getPackedUserOp({abi, functionName, args})

    if (statusUserOpHash == 'success') {
      signTypedData({
        types, 
        primaryType: 'userOpHash',
        message  // = userOpHash, derived from packedUserOp. 
      })} 
  }

  // when message is _signed_ it is send to the bundler. 
  useEffect(() => {
    if (signature && isSuccess && embeddedWallet) {
      console.log("bundlerClient checks passed, going to be called")
      bundlerClient.sendUserOperation({
        userOperation: {
            sender: parseEthAddress(loyaltyCardAddress), 
            nonce: addressNonce.current,
            factory: prog.cardsFactory,
            factoryData: cardFactoryData.current, 
            callData: executeCallData.current,
            maxFeePerGas,
            maxPriorityFeePerGas,
            preVerificationGas,
            verificationGasLimit,
            callGasLimit,
            signature: signature 
          }
      })
    }
  }, [signature, isSuccess, embeddedWallet, prog.cardsFactory, maxFeePerGas, maxPriorityFeePerGas, preVerificationGas, verificationGasLimit, callGasLimit])

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


