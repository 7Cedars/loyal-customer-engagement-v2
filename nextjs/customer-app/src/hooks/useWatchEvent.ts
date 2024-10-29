// Ok, so it seems useWatchContractEvents from Wagmi does not work properly. Build my own hook. 

import {  useState } from "react";
import { Status, } from "@/types";
import {  Log } from "viem";
import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi";
import { publicClient } from "@/context/clients";
import { useAccount } from "wagmi";
import { chainSettings } from "@/context/chainSettings";
import { useAppSelector } from "@/redux/hooks";

// A custom watch event hook that watches the current loyalty program for selected events.
// The status return value can be used to update buttons, etc. because it watches for an event to pass (and hence chained transactions to _all_ be successfully completed.)
// Drawback: it does not properly give an error message: because chained transactions do not explicitly return an error.  

export default function useWatchEvent() {
  const {connector, chainId} = useAccount(); 
  const [eventLog, setEventLog] = useState<Log>()
  const [status, setStatus] = useState<Status>("idle") 
  const [error, setError] = useState<any>()
  const deployed = chainSettings(chainId ? chainId : 31337) 
  const programsFactory: `0x${string}` = deployed ? deployed.factoryProgramsAddress : '0x0'
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)
  
  const watchEvent = (eventName: string) => { 
      if (status == "idle") {
        try {
          setStatus("pending")
          const unwatch = publicClient.watchContractEvent({
            address: prog.address,
            abi: loyaltyProgramAbi,
            eventName: eventName,
            onLogs: logs => {
                unwatch() 
                setEventLog(logs[0])
                setStatus("success")
                }
          })
      } catch (error) {
        setStatus("error")
        setError(error);
      }
    }
  }
  return {watchEvent, eventLog, status, error}
}