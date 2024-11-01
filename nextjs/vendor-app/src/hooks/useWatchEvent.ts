// Ok, so it seems useWatchContractEvents from Wagmi does not work properly. Build my own hook. 

import {  useState } from "react";
import { Status, } from "@/types";
import {  Log } from "viem";
import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi";
import { publicClient } from "@/context/clients";
import { useAccount } from "wagmi";
import { chainSettings } from "@/context/chainSettings";

export default function useWatchEvent() {
  const {connector, chainId} = useAccount(); 
  const [eventLog, setEventLog] = useState<Log>()
  const [status, setStatus] = useState<Status>("idle") 
  const [error, setError] = useState<any>()
  const deployed = chainSettings(chainId ? chainId : 31337) 
  const programsFactory: `0x${string}` = deployed ? deployed.factoryProgramsAddress : '0x0'

  
  const watchEvent = (eventName: string) => {
      if (status == "idle") {
        try {
          setStatus("pending")
          const unwatch = publicClient.watchContractEvent({
            address: programsFactory,
            abi: factoryProgramsAbi,
            eventName: eventName,
            onLogs: logs => {
                unwatch() 
                setEventLog(logs[0])
                }
          })
          setStatus("success")
      } catch (error) {
        setStatus("error")
        setError(error);
      }
    }
  }
  return {watchEvent, eventLog, status, error}
}