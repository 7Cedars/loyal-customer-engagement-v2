// Ok, so there are cleaner and shorter ways to do this. But this does the job. and relatively efficiently. 

/**
*/ 

import { useCallback, useRef, useState } from "react";
import { Status, Event, EventsInBlocks } from "@/types";
import { decodeEventLog, Log } from "viem";
import { parseEthAddress, parseEventLogs } from "@/utils/parsers";
import { loyaltyProgramAbi } from "@/context/abi";
import { publicClient } from "@/context/clients";
import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useAccount } from "wagmi";
import { useDispatch } from "react-redux";
import { setProgram } from "@/redux/reducers/programReducer";

export default function useEvents() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {connector, chainId} = useAccount(); 
  const [fetchedEvents, setFetchedEvents] = useState<EventsInBlocks>()
  const [allEvents, setAllEvents] = useState<EventsInBlocks[]>()
  const [status, setStatus] = useState<Status>("isIdle") 
  const [error, setError] = useState<any>();
  const dispatch = useDispatch()  

  console.log("connector @useAccount", connector)
  
  const getBlockData = async (events: Event[]) => {
    let event: Event
    let eventsUpdated: Event[] = []

    if (events && publicClient) { 
      try {
        for await (event of events) {
        const data: unknown = await publicClient.getBlock({
          blockNumber: BigInt(Number(event.blockNumber)) 
        })
        eventsUpdated.push({...event, blockData: data})
      }
      return eventsUpdated
      } catch (error) {
        setStatus("isError") 
        setError(error)
      }
    }
  }

  const fetchEvents = useCallback(
    async (startBlock: number, endBlock: number) => {
      const saved: EventsInBlocks[] = prog.events ? prog.events : []  
      setAllEvents(saved)

      // check if blocks have already been queried. 
      const alreadyChecked = saved.find(block => {
        return block.startBlock <= endBlock && startBlock <= block.endBlock 
      })

      if (alreadyChecked) {
        setStatus("isError")
        setError("requested blocks already queried") 
        return;  
      }
      
      // if checks pass: 
      // fetch events
      const logs: Log[] = await publicClient.getContractEvents({
        abi: loyaltyProgramAbi, 
        address: prog.address,
        fromBlock: BigInt(startBlock),
        toBlock: BigInt(endBlock) 
      }) 
      // decode the events
      const events: Event[] = logs.map((log: Log) => {
        const event = decodeEventLog({
          abi: loyaltyProgramAbi,
          topics: log.topics, 
          data: log.data
        })

        return {
          address: log.address, 
          blockNumber: log.blockNumber, 
          logIndex: log.logIndex, 
          event: event.eventName, 
          args: event.args
        }
      })
      const eventsUpdated = await getBlockData(events)

      const eventsInBlocks: EventsInBlocks = {
        startBlock, 
        endBlock, 
        events: eventsUpdated ? eventsUpdated : []
      }
      const allEventsTemp = [...saved, eventsInBlocks] 

      // sort queries by block number.  
      allEventsTemp.sort((a, b) => {
        return a.startBlock > b.startBlock ? -1 : 1 // the latest block, with the largest block number, should end up first in line. 
      })

      // store all items. 
      setFetchedEvents(eventsInBlocks)
      setAllEvents(allEventsTemp)
      // NB £CONTINUE HERE: EVENTS HAVE TO BE STORED IN THE PROGRAM REDUX object. NOT in local storage! 
      // a hack to correctly encode bigints. See https://github.com/GoogleChromeLabs/jsbi/issues/30 
      
      dispatch(setProgram({
        ...prog, 
        events: allEventsTemp
      }))
      setStatus("isSuccess")
    }, [prog.address]
  ) 

  return {fetchEvents, fetchedEvents, allEvents, status, error}
}