"use client"; 

import { Layout } from "@/components/application/Layout"
import { NoteText, SectionText, TitleText } from "@/components/ui/StandardisedFonts"
import { GiftAvailable } from "./GiftAvailable";
import { GiftSelected } from "./GiftSelected";
import { InputBox } from "@/components/ui/InputBox";
import { readContracts } from '@wagmi/core'
import { TabChoice } from "@/components/ui/TabChoice";
import { useCallback, useEffect, useState } from "react";
import { Gift, GiftsInBlocks } from "@/types";
import { useGifts } from "@/hooks/useGifts";
import { chainSettings } from "@/context/chainSettings";
import { useBlockNumber, useChainId, useReadContract } from "wagmi";
import { useAppSelector } from "@/redux/hooks";
import { loyaltyProgramAbi } from "@/context/abi";
import { wagmiConfig } from "../../../wagmi-config";

export default function Page() {
  const [mode, setMode] = useState<string>("Available")
  const [allowedGifts, setAllowedGifts] = useState<`0x${string}`[]>()
  const {status, allGifts, fetchedGifts, fetchGifts, error} = useGifts()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const chainId = useChainId()
  const settings = chainSettings(chainId)

  console.log({allowedGifts})
  console.log({status, allGifts})

  const fetchAllowedGifts = useCallback(
    async () => {
      const programContract = {
        address: prog.address,
        abi: loyaltyProgramAbi,
      } as const
      try {
      const result = await readContracts(wagmiConfig, {
        contracts: [
          {
            ...programContract,
            functionName: 'getAllowedGifts',
          },
        ]
      })
        if (result && result[0].status == 'success') {     
          setAllowedGifts(result[0].result as `0x${string}`[]) 
        } 
      } catch(error) {
        console.log(error)
      }
    }, [prog.address]
  )

  // fetch events for blocks that are newer than those already fetched 
  useEffect(() => {
    if (settings && settings.fetchBlockAmount && blockNumberIsFetched && status == "isIdle") {
      const currentBlock: number = Number(blockNumber)
      let fromBlock = currentBlock < settings.fetchBlockAmount ? 0 : currentBlock - settings.fetchBlockAmount
  
      if (allGifts && allGifts[0].endBlock > fromBlock) { 
        fromBlock = allGifts[0].endBlock + 1
      }
      // only fetch blocks if these are more than a minimum amount of blocks. 
      // avoids loop + unnecessary api calls. 
      if (currentBlock - fromBlock > settings.minimumBlocksToFetch) {
        fetchGifts(fromBlock, currentBlock) 
      }
    }
  }, [ , blockNumberIsFetched, allGifts, blockNumber, fetchGifts, settings, status ])

  useEffect(() => {
    if (mode == "Selected") fetchAllowedGifts() 
  }, [fetchAllowedGifts, mode])

  return (
    <Layout>  
      <TitleText title = "Gifts" size = {2} /> 
      
      <TabChoice 
        optionOne="Available"
        optionTwo="Selected"
        onChange={(choice) => setMode(choice)}
      /> 

      { mode == "Available" && allGifts ? 
        <>
          <section 
            className="flex flex-col h-full justify-start p-2 overflow-auto pb-20"
            >

            {allGifts?.map((gifts: GiftsInBlocks) => 
              gifts.gifts.map(gift => 
                <GiftAvailable 
                key = {gift.address} 
                address = {gift.address} 
                name = {gift.name} 
                symbol = {gift.symbol}
                uri = {gift.uri} 
                points = {gift.points}
                additionalReq ={gift.additionalReq} 
                metadata = {gift.metadata}
              />
                ))
              }        
          </section>
        </>
        : mode != "Available" && allowedGifts && allowedGifts.length > 0 ?
        <>          
          <section 
            className="flex flex-col h-full justify-start p-2 overflow-auto pb-20"
            >
            {allGifts?.map((gifts: GiftsInBlocks) => 
              gifts.gifts.map(gift => 
                allowedGifts.includes(gift.address) ? 
                <GiftSelected 
                  key = {gift.address} 
                  address = {gift.address} 
                  name = {gift.name} 
                  symbol = {gift.symbol}
                  uri = {gift.uri} 
                  points = {gift.points}
                  additionalReq ={gift.additionalReq} 
                  metadata = {gift.metadata}
                />
                :
                null
                ))
              }        
          </section>
        </>
        :
        <>          
          <section 
            className="flex flex-col h-full justify-start p-2 overflow-auto pb-20"
            >
          <NoteText 
            message ={"No selected gifts found"}
            size = {1}
            align = {1}
          />
          </section>
        </>
        }
    </Layout>
  )
}