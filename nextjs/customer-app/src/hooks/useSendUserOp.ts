"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useEffect, useRef, useState } from "react"
import { Abi, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex } from "viem"
import { toPackedUserOperation } from "viem/account-abstraction"
import { useReadContract, useSignTypedData } from "wagmi"
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
  const randomNonce  = useRef<bigint>(BigInt(Math.random() * 10 ** 18))
  const functionData = useRef<Hex>('0x0')
  const executeCallData = useRef<Hex>('0x0')
  const [packedUserOp, setPackedUserOp] = useState<PackedUserOperation | undefined>()
  const maxFeePerGas: bigint = 99985502n
  const maxPriorityFeePerGas: bigint = 1221000n
  const preVerificationGas: bigint = 66875n
  const verificationGasLimit: bigint = 373705n
  const callGasLimit: bigint = 170447n
  
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  const {data: loyaltyCardAddress, status: statusLoyaltyCardAddress}  = useReadContract({
    abi: factoryCardsAbi,
    address: prog.cardsFactory,
    functionName: 'getAddress',
    args: [embeddedWallet?.address, prog.address, 24] // NB: SALT VALUE IS NOT CORRECT YET! 
  }) 
  const {data: userOpHash, status: statusUserOpHash} = useReadContract({
    abi: entryPointAbi,
    address: prog.entryPoint,
    functionName: 'getUserOpHash',
    args: [packedUserOp]
  }) 
  const message = {
    digest: parseHex(userOpHash)
  } as const
  const { data: signature, isPending, isError, isSuccess, signTypedData, reset } = useSignTypedData()
  
  // this function does all the data prep. 
  const getPackedUserOp = ({abi, functionName, args}: sendUserOpProps) => {
    functionData.current = encodeFunctionData({
      abi: loyaltyProgramAbi,
      functionName: 'requestPointsAndCard', 
      args: args // see args of requestPointsAndCard
    })

    executeCallData.current = encodeFunctionData({
      abi: loyaltyCardAbi,
      functionName: 'execute', 
      args: [
        loyaltyCardAddress,
        0n,  
        embeddedWallet?.address
      ]
    })

    const packedUserOpTemp = toPackedUserOperation({
      sender: parseEthAddress(loyaltyCardAddress), // needs to be loyaltyCard. 
      nonce: randomNonce.current,
      factory: prog.cardsFactory,
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
      bundlerClient.sendUserOperation({
        userOperation: {
            sender: parseEthAddress(embeddedWallet.address), // needs to be loyaltyCard. 
            nonce: randomNonce.current,
            factory: prog.cardsFactory,
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

  return sendUserOp // note, for now no error handling, status updates, etc. That's for later.  

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


