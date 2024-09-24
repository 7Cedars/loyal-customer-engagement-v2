import { Button } from "@/components/ui/Button";
import { NumPad } from "@/components/ui/NumPad";
import { useAppSelector } from "@/redux/hooks";
import { useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { useEffect, useState } from "react";
import { Hex, parseEther } from "viem";
import { useDispatch } from "react-redux";
import { setBalanceProgram } from "@/redux/reducers/programReducer";

export const TransferFunds = () => {
  const [ transferAmount, setTransferAmount ] = useState<number>(0)
  const { sendTransaction, data: dataTransaction, status } = useSendTransaction()
  const [hex, setHex] = useState<Hex | undefined>()
  const dispatch = useDispatch()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {data: balanceData, refetch, fetchStatus} = useBalance({ address: prog.address })
  const decimals = 10 ** 3
  const { data, isError, isLoading, isSuccess } = useWaitForTransactionReceipt(
    {  confirmations: 1, hash: hex })

  useEffect(() => {
    setHex(undefined)
    if (dataTransaction) setHex(dataTransaction) 
  }, [dataTransaction])

  useEffect(() => {
    if (transferAmount) setHex(undefined) 
  }, [transferAmount])

  useEffect(() => {
    if(isSuccess && balanceData) {
      refetch()
      dispatch(setBalanceProgram(Number(balanceData?.value) / 10 ** balanceData?.decimals))  
    } 
  }, [isSuccess, balanceData, dispatch, refetch])

  console.log("fetchStatus:", fetchStatus)

  return (
    <section className="grow flex flex-col items-center justify-center"> 
      <a 
        className="text-2xl p-2"
        style={{color:prog.colourAccent}}
        >
        {String(transferAmount)} Eth
      </a>
      <div className="grow">
        <NumPad onChange={(amount) =>{setTransferAmount(amount / decimals)}}/>
      </div>
      <div className="w-full h-12 p-1">
        {
        isSuccess ? 
          <Button disabled> Success! </Button>
        :
        isLoading ? // isPending does not reset. £bug? 
          <Button disabled> Pending... </Button>
        :
        isError ?
          <Button disabled> ERROR </Button> // £todo improve error handling
        :
        <Button onClick={()=> sendTransaction({
          to: prog.address,
          value: parseEther(String(transferAmount)),
          })}>
          Transfer
        </Button>
        }
      </div>
    </section> 
  );
}


