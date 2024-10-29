// Ok, so there are cleaner and shorter ways to do this. But this does the job. and relatively efficiently. 

/**
*/ 

import { useCallback, useRef, useState } from "react";
import { Status, Event, EventsInBlocks } from "@/types";
import { decodeEventLog, Log } from "viem";
import { loyaltyProgramAbi } from "@/context/abi";
import { publicClient } from "@/context/clients";
import { useAppSelector } from "@/redux/hooks";
import { useAccount } from "wagmi";
import { useDispatch } from "react-redux";
import { setProgram } from "@/redux/reducers/programReducer";

export default function useEvents() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {connector, chainId} = useAccount(); 
  const [fetchedEvents, setFetchedEvents] = useState<EventsInBlocks>()
  const [allEvents, setAllEvents] = useState<EventsInBlocks>()
  const [status, setStatus] = useState<Status>("idle") 
  const [error, setError] = useState<any>();
  const dispatch = useDispatch()  
  
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
        setStatus("error") 
        setError(error)
      }
    }
  }

  const fetchEvents = useCallback(
    async (startBlock: number, endBlock: number) => {
      let genesisReached = prog.events.genesisReached
      setAllEvents(prog.events)

      // check if blocks have already been queried. 
      const alreadyChecked = prog.events.startBlock <= endBlock && startBlock <= prog.events.endBlock 
      if (alreadyChecked) {
        setStatus("error")
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

        // avoids events being fetched _before_ deployment of program. 
        event.eventName == 'LoyaltyProgramDeployed' ? genesisReached = true : genesisReached  

        return {
          address: log.address, 
          blockNumber: log.blockNumber, 
          logIndex: log.logIndex, 
          event: event.eventName, 
          args: event.args
        }
      })
      const eventsUpdated = await getBlockData(events)

      // NB! The following transforms all bigints to strings. 
      // this is necessary as otherwise json (and as consequence Redux) cannot serialise them.   
      // It is a very ugly hack. But will have to do for now. 
      const eventsParsed = eventsUpdated ? eventsUpdated.map(obj => (
        Object.fromEntries(
          Object.entries(obj).map(
            ([key, val]) => [ 
              key, 
              typeof val === 'bigint' ? val.toString() 
              : 
              typeof val === 'object' ? Object.fromEntries(
                Object.entries(val).map(
                  ([key, val]) => [ key, typeof val === 'bigint' ? val.toString() : val ]
                ))
              : 
              val
             ] 
          )
        )
      )) : null; 

      const eventsInBlocks: EventsInBlocks = {
        startBlock: Number(startBlock), 
        endBlock: Number(endBlock), 
        genesisReached, 
        events: eventsParsed ? eventsParsed as Event[] : [] 
      }

      // Setting the startBlock and endBlock of all events queried.
      // Note that a '0' from prog events is ignored: this is the default start value in the redux store.   
      const allEventsTemp = {
        startBlock: eventsInBlocks.startBlock < prog.events.startBlock && prog.events.startBlock != 0 ? eventsInBlocks.startBlock : prog.events.startBlock,
        endBlock: eventsInBlocks.endBlock > prog.events.endBlock ? eventsInBlocks.endBlock : prog.events.endBlock,
        genesisReached, 
        events: [...prog.events.events, ...eventsInBlocks.events]
      }

      // sort queries by block number. 
      allEventsTemp.events.sort((a, b) => {
        return a.blockData.timestamp > b.blockData.timestamp ? -1 : 1 // the latest block, with the largest block number, should end up first in line. 
      })

      // store all items. 
      setFetchedEvents(eventsInBlocks)
      setAllEvents(allEventsTemp)
      dispatch(setProgram({
        ...prog, 
        events: allEventsTemp
      }))
      setStatus("success")
    }, [prog, dispatch]
  ) 

  return {fetchEvents, fetchedEvents, allEvents, status, error}
}