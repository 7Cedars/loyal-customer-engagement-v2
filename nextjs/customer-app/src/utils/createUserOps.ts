import { loyaltyCardAbi, loyaltyProgramAbi } from '@/context/abi';
import {encodeFunctionData, Hex} from 'viem';

// needs to be encoded twice. 

type EncodeRequestPointsAndCardProps = {
  program: Hex; 
  points: number;
  uniqueNumber: number;
  signature: Hex; 
  ownerCard: Hex;  
}

type EncodeExecuteCallDataProps = {
  dest: Hex; 
  value: number;
  functionData: Hex;  
}

export const encodeRequestPointsAndCard = ({program, points, uniqueNumber, signature, ownerCard}: EncodeRequestPointsAndCardProps) => {
  const functionData = encodeFunctionData({
    abi: loyaltyProgramAbi,
    functionName: 'requestPointsAndCard', 
    args: [
      program,
      points, // does this need to be Bigint? 
      uniqueNumber, // does this need to be Bigint? 
      signature, 
      ownerCard
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

const createPackedUserOperation = () => {

}
