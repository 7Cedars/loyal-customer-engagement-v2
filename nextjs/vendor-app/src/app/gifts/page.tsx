"use client"; 

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { GiftInfo } from "./GiftInfo";
import { InputBox } from "@/components/ui/InputBox";
import { TabChoice } from "@/components/ui/TabChoice";
import { useEffect, useState } from "react";
import { Gift, GiftsInBlocks } from "@/types";
import { useGifts } from "@/hooks/useGifts";
import { Button } from "@/components/ui/Button";
import { chainSettings } from "@/context/chainSettings";
import { useBlockNumber, useChainId } from "wagmi";

export default function Page() {
  const [mode, setMode] = useState<string>()
  const [savedGifts, setSavedGifts] = useState<Gift[]>([])
  const {status, allGifts, fetchedGifts, fetchGifts, error} = useGifts()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const chainId = useChainId()
  const settings = chainSettings(chainId)

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
      console.log({
        fromBlock: fromBlock, 
        currentBlock: currentBlock
      })
      if (currentBlock - fromBlock > settings.minimumBlocksToFetch) {
        fetchGifts(fromBlock, currentBlock) 
      }
    }
  }, [ blockNumberIsFetched, allGifts, blockNumber, fetchGifts, settings, status ])

  console.log({
    status: status, 
    allGifts: allGifts,
    fetchedGifts: fetchedGifts, 
    error: error
  })

  return (
    <Layout>  
      <TitleText title = "Gifts" size = {2} /> 
      
      <TabChoice 
        optionOne="Selected"
        optionTwo="Available"
        onChange={(choice) => setMode(choice)}
      /> 

      <div className="w-full md:w-96 self-center"> 
        <InputBox nameId = {"searchGifts"} placeholder="Search gifts" /> 
      </div>
      
      <section className="flex flex-col divide-y justify-start p-2 overflow-auto  pb-20">

        {allGifts?.map((gifts: GiftsInBlocks) => 
          gifts.gifts.map(gift =>       
            <GiftInfo 
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
    </Layout>
  )
}