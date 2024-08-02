// Ok, so there are cleaner and shorter ways to do this. But this does the job. and relatively efficiently. 

/**
*/ 

import { useRef, useState } from "react";
import { Status, Event } from "@/types";
import { Log } from "viem";
import { parseEthAddress, parseEventLogs } from "@/utils/parsers";
import { loyaltyProgramAbi } from "@/context/abi";
import { usePublicClient } from "wagmi";
import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";

type UseEventProps = {
  fromBlock: bigint; 
  toBlock: bigint; 
}

export default function useEvents({fromBlock, toBlock}: UseEventProps) {
  const publicClient = usePublicClient()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  const [ giftListed, setGiftListed ] = useState<Event[]>([]) 
  const [ pointsExchanged, setPointsExchanged ] = useState<Event[]>([])  
  const [ giftRedeemed, setGiftRedeemed ] = useState<Event[]>([]) 
  const [ cardBlocked, setCardBlocked ] = useState<Event[]>([]) 
  const [ creationCardsAllowed, setCreationCardsAllowed ] = useState<Event[]>([]) 
  const [ giftsMinted, setGiftsMinted ] = useState<Event[]>([])  
  const [ colourSchemeChanged, setColourSchemeChanged ] = useState<Event[]>([]) 
  const [ imageUriChanged, setImageUriChanged ] = useState<Event[]>([]) 

  const [ events, setEvents ] = useState<Event[]>([]) 
  const statusGiftListed = useRef<Status>("isIdle")
  const statusPointsExchanged = useRef<Status>("isIdle")  
  const statusGiftRedeemed = useRef<Status>("isIdle")
  const statusCardBlocked = useRef<Status>("isIdle")
  const statusCreationCardsAllowed = useRef<Status>("isIdle") 
  const statusGiftsMinted = useRef<Status>("isIdle")
  const statusColourSchemeChanged = useRef<Status>("isIdle") 
  const statusImageUriChanged = useRef<Status>("isIdle")
  const statusBlockData = useRef<Status>("isIdle")
  const [status, setStatus] = useState<Status>("isIdle") 

  // This one is done. I have to do the same for the seven (!) others.. 
  const getGiftListed = async () => {
    statusGiftListed.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'LoyaltyGiftListed',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setGiftListed([...events])
      statusGiftListed.current = "isSuccess" 
    } catch (error) {
      statusGiftListed.current = "isError"
      console.log(error)
    }
  }

  const getPointsExchanged = async () => {
    statusPointsExchanged.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'LoyaltyPointsExchangeForGift',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setPointsExchanged([...events])
      statusPointsExchanged.current = "isSuccess" 
    } catch (error) {
      statusPointsExchanged.current = "isError"
      console.log(error)
    }
  }

  const getGiftRedeemed = async () => {
    statusGiftRedeemed.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'LoyaltyGiftRedeemed',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setGiftRedeemed([...events])
      statusGiftRedeemed.current = "isSuccess" 
    } catch (error) {
      statusGiftRedeemed.current = "isError"
      console.log(error)
    }
  }

  const getCardBlocked = async () => {
    statusCardBlocked.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'LoyaltyCardBlocked',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setCardBlocked([...events])
      statusCardBlocked.current = "isSuccess" 
    } catch (error) {
      statusCardBlocked.current = "isError"
      console.log(error)
    }
  }

  const getCreationCardsAllowed = async () => {
    statusCreationCardsAllowed.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'CreationCardsAllowed',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setCreationCardsAllowed([...events])
      statusCreationCardsAllowed.current = "isSuccess" 
    } catch (error) {
      statusCreationCardsAllowed.current = "isError"
      console.log(error)
    }
  }

  const getGiftsMinted = async () => {
    statusGiftsMinted.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'GiftsMinted',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setGiftsMinted([...events])
      statusGiftsMinted.current = "isSuccess" 
    } catch (error) {
      statusGiftsMinted.current = "isError"
      console.log(error)
    }
  }

  const getColourSchemeChanged = async () => {
    statusColourSchemeChanged.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'ColourSchemeChanged',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setColourSchemeChanged([...events])
      statusColourSchemeChanged.current = "isSuccess" 
    } catch (error) {
      statusColourSchemeChanged.current = "isError"
      console.log(error)
    }
  }

  const getImageUriChanged = async () => {
    statusImageUriChanged.current = "isLoading"
    if (publicClient)
    try {
      const eventLogs: Log[] = await publicClient.getContractEvents( { 
        abi: loyaltyProgramAbi, 
        address: parseEthAddress(prog.address), 
        eventName: 'ImageUriChanged',
        fromBlock: fromBlock, 
        toBlock: toBlock 
      });
      console.log("eventLogs: ", eventLogs)
      const events =  parseEventLogs(eventLogs)
      setImageUriChanged([...events])
      statusImageUriChanged.current = "isSuccess" 
    } catch (error) {
      statusImageUriChanged.current = "isError"
      console.log(error)
    }
  }
  
  const getBlockData = async () => {
    statusBlockData.current = "isLoading"

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
      setEvents(eventsUpdated) 
      statusBlockData.current = "isSuccess" 
      } catch (error) {
        statusBlockData.current = "isError" 
        console.log(error)
      }
    }
  }

  useEffect(() => {
    // fetching all events within time period. 
    getGiftListed()
    getPointsExchanged()
    getGiftRedeemed()
    getCardBlocked()
    getCreationCardsAllowed()
    getGiftsMinted()
    getColourSchemeChanged()
    getImageUriChanged()
  }, [ ])

  useEffect(() => {
    if (
      statusGiftListed.current == "isSuccess" &&
      statusPointsExchanged.current == "isSuccess" &&  
      statusGiftRedeemed.current == "isSuccess" &&
      statusCardBlocked.current == "isSuccess" &&
      statusCreationCardsAllowed.current == "isSuccess" && 
      statusGiftsMinted.current == "isSuccess" &&
      statusColourSchemeChanged.current == "isSuccess" && 
      statusImageUriChanged.current == "isSuccess"
      ) {
        const allEvents = [
          ...giftListed, 
          ...pointsExchanged, 
          ...giftRedeemed, 
          ...cardBlocked, 
          ...creationCardsAllowed, 
          ...giftsMinted, 
          ...colourSchemeChanged,
          ...imageUriChanged
        ]
        allEvents.sort((firstEvent, secondEvent) => 
          Number(firstEvent.blockNumber) - Number(secondEvent.blockNumber)
        );
        setEvents(allEvents)
      }
  }, [
    giftListed, 
    pointsExchanged, 
    giftRedeemed, 
    cardBlocked, 
    creationCardsAllowed, 
    giftsMinted, 
    colourSchemeChanged,
    imageUriChanged
  ])

  useEffect(() => {
    if (
      statusGiftListed.current == "isSuccess" &&
      statusPointsExchanged.current == "isSuccess" &&  
      statusGiftRedeemed.current == "isSuccess" &&
      statusCardBlocked.current == "isSuccess" &&
      statusCreationCardsAllowed.current == "isSuccess" && 
      statusGiftsMinted.current == "isSuccess" &&
      statusColourSchemeChanged.current == "isSuccess" && 
      statusImageUriChanged.current == "isSuccess" && 
      events.length > 0 
    ) {
      getBlockData() 
    } 

    if (
      statusGiftListed.current == "isSuccess" &&
      statusPointsExchanged.current == "isSuccess" &&  
      statusGiftRedeemed.current == "isSuccess" &&
      statusCardBlocked.current == "isSuccess" &&
      statusCreationCardsAllowed.current == "isSuccess" && 
      statusGiftsMinted.current == "isSuccess" &&
      statusColourSchemeChanged.current == "isSuccess" && 
      statusImageUriChanged.current == "isSuccess" && 
      statusBlockData.current == "isIdle"  && 
      events.length == 0 
    ) {
      statusBlockData.current = "isSuccess" 
    } 
  }, [ 
    events
  ])

   // updating status
   useEffect(() => {
    if (
      statusGiftListed.current == "isError" ||
      statusPointsExchanged.current == "isError" ||  
      statusGiftRedeemed.current == "isError" ||
      statusCardBlocked.current == "isError" ||
      statusCreationCardsAllowed.current == "isError" || 
      statusGiftsMinted.current == "isError" ||
      statusColourSchemeChanged.current == "isError" || 
      statusImageUriChanged.current == "isError" || 
      statusBlockData.current == "isError"
    ) {
      setStatus("isError")
    }
    if (
      statusGiftListed.current == "isLoading" ||
      statusPointsExchanged.current == "isLoading" ||  
      statusGiftRedeemed.current == "isLoading" ||
      statusCardBlocked.current == "isLoading" ||
      statusCreationCardsAllowed.current == "isLoading" || 
      statusGiftsMinted.current == "isLoading" ||
      statusColourSchemeChanged.current == "isLoading" || 
      statusImageUriChanged.current == "isLoading" || 
      statusBlockData.current == "isLoading"
    ) {
      setStatus("isLoading")
    }
    if (
      statusGiftListed.current == "isSuccess" &&
      statusPointsExchanged.current == "isSuccess" &&  
      statusGiftRedeemed.current == "isSuccess" &&
      statusCardBlocked.current == "isSuccess" &&
      statusCreationCardsAllowed.current == "isSuccess" && 
      statusGiftsMinted.current == "isSuccess" &&
      statusColourSchemeChanged.current == "isSuccess" && 
      statusImageUriChanged.current == "isSuccess" && 
      statusBlockData.current == "isSuccess" 
    ) {
      setStatus("isSuccess")
    }
  }, [ 
    events
  ])

  return {status, events}
}