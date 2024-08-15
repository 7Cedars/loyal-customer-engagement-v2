"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints } from "@/types"
import { parseBigInt, parseEthAddress } from "@/utils/parsers"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useRef } from "react"
import { encodeFunctionData, Hex, hexToBigInt, numberToBytes, numberToHex } from "viem"
import { toPackedUserOperation } from "viem/account-abstraction"
import { useReadContract, useSignTypedData } from "wagmi"
import { SignTypedDataData } from "wagmi/query"

 // I think this will be needed

// import here. 

// takes calldata,  
// imports user, entrypoint address

// follow with test in foundry, refactor to react / next / wagmi -- interesting. 


// bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.requestPointsAndCard.selector, program, points, uniqueNumber, signature, ownerCard);
// bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

type EncodeRequestPointsAndCardProps = { 
  program: Hex;
  points: bigint;  
  uniqueNumber: bigint;  
  signature: Hex; 
}

const types = {
  userOpHash: [
    { name: 'digest', type: 'bytes32' }
  ],
} as const

export const usePackedUserOp = (request: QrPoints) => { // here types can be added: "exchangePoints", etc 
  const randomNonce  = useRef<bigint>(BigInt(Math.random() * 10 ** 18))
  const { data: signature, isPending, isError, isSuccess, signTypedData, reset } = useSignTypedData()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  const encodeRequestPointsAndCard = ({program, points, uniqueNumber, signature}: EncodeRequestPointsAndCardProps) => {
    const functionData = encodeFunctionData({
      abi: loyaltyProgramAbi,
      functionName: 'requestPointsAndCard', 
      args: [
        program,
        points, // does this need to be Bigint? 
        uniqueNumber, // does this need to be Bigint? 
        signature, 
        embeddedWallet?.address
      ]
    })
  
    return functionData
  }

  const encodeExecuteCallData = ({dest, value, functionData}: EncodeExecuteCallDataProps) => {
    const executeCallData = encodeFunctionData({
      abi: loyaltyCardAbi,
      functionName: 'execute', 
      args: [
        dest,
        value, // does this need to be Bigint? 
        functionData
      ]
    })
    return executeCallData
  }

  const createPackedUserOp = (executeCallData: Hex) => {
    // This is all still really iffy. Have to check some github repos that implement this. Pimlico? 
    const verificationGasLimit: number = 16777216;
    const callGasLimit = verificationGasLimit;
    const maxPriorityFeePerGas: number = 256;
    const maxFeePerGas = maxPriorityFeePerGas;

    return({
      sender: loyaltyCard.data, // loyaltyCard.data, // use result from resultReadContractFactory here 
      nonce: randomNonce.current, // randomNonce,
      initCode: '0x0',
      callData: executeCallData,
      accountGasLimits: numberToHex(callGasLimit, { size: 32 }), //  | callGasLimit), -- should be bytes... Hex? 
      preVerificationGas: numberToHex(verificationGasLimit, { size: 32 }),
      gasFees: numberToHex(maxFeePerGas, { size: 32 }), // -- should be bytes... // Hex? 
      paymasterAndData: '0x0',
      signature: '0x0'
    })
  }

  const handleSigningUserOp = () => {
    if (prog.address) {
      const message = {
        userOp: userOpHash
      } as const
    
      signTypedData({
        types, 
        primaryType: 'userOpHash',
        message
      })} 
  }

  ///////////////////////// 
  // Executing functions // 
  /////////////////////////

  const loyaltyCard = useReadContract({
    abi: factoryCardsAbi,
    address: prog.cardsFactory,
    functionName: 'getAddress',
    args: [embeddedWallet?.address, prog.address, 24]
  }) 
  console.log("resultReadContractFactory: ", loyaltyCard.data)

  const functionData = encodeRequestPointsAndCard({
    program: request.program ? request.program : '0x0000000000000000000000000000000000000000', 
    points: request.points, 
    uniqueNumber: request.uniqueNumber, 
    signature: request.signature ?  request.signature : '0x0'
    }); 
  console.log("functionData: ", functionData)

  const executeCallData = encodeExecuteCallData({
    dest: prog.address ? prog.address : '0x0', 
    value: 0,  
    functionData: functionData
  })
  console.log("executeCallData: ", executeCallData)

  const packedUserOp = createPackedUserOp(executeCallData)
  console.log("packedUserOp: ", packedUserOp)

  const userOpHash = useReadContract({
    abi: entryPointAbi,
    address: prog.entryPoint,
    functionName: 'getUserOpHash',
    args: [packedUserOp]
  }) 
  console.log("userOpHash: ", userOpHash.data )


  type EncodeExecuteCallDataProps = {
    dest: Hex; 
    value: number;
    functionData: Hex;  
  }
  
 


} 


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


