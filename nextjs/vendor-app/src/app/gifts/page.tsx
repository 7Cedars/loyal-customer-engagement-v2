"use client"; 

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { GiftAvailable } from "./GiftAvailable";
import { GiftSelected } from "./GiftSelected";
import { InputBox } from "@/components/ui/InputBox";
import { TabChoice } from "@/components/ui/TabChoice";
import { useEffect, useState } from "react";
import { Gift, GiftsInBlocks } from "@/types";
import { useGifts } from "@/hooks/useGifts";
import { chainSettings } from "@/context/chainSettings";
import { useBlockNumber, useChainId, useReadContract } from "wagmi";
import { useAppSelector } from "@/redux/hooks";
import { loyaltyProgramAbi } from "@/context/abi";

export default function Page() {
  const [mode, setMode] = useState<string>()
  const {status, allGifts, fetchedGifts, fetchGifts, error} = useGifts()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const chainId = useChainId()
  const settings = chainSettings(chainId)
  const { data: allowedGiftAddresses, isError, error: errorReadContract, isLoading, status: statusReadContract, refetch } = useReadContract({
    address: prog.address,
    abi: loyaltyProgramAbi,
    functionName: 'getAllowedGifts'
  })
  const allowedGifts = allowedGiftAddresses as `0x${string}`[] 

  // fetching allowed gifts every time mode is changed. 
  useEffect(() => {
    refetch()
  }, [ , refetch, mode, chainId])

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

  return (
    <Layout>  
      <TitleText title = "Gifts" size = {2} /> 
      
      <TabChoice 
        optionOne="Available"
        optionTwo="Selected"
        onChange={(choice) => setMode(choice)}
      /> 

      { mode == "Available" ? 
        <>
          <section 
            className="flex flex-col h-full justify-start p-2 overflow-auto pb-20"
            >

            {allGifts?.map((gifts: GiftsInBlocks) => 
              gifts.gifts.map(gift => 
                allowedGifts.includes(gift.address) ? 
                null
                : 
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
        :
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
        }
    </Layout>
  )
}