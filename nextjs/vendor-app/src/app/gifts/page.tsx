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
import { Button } from "@/components/ui/Button";



export default function Page() {
  const [mode, setMode] = useState<string>("Available")
  const [allowedGifts, setAllowedGifts] = useState<`0x${string}`[]>()
  const {status, allGifts, fetchedGifts, fetchGifts, error} = useGifts()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const chainId = useChainId()
  const settings = chainSettings(chainId)

  console.log({allowedGifts})
  console.log({status, allGifts, error})

  const renderFetchButton = (allGifts: GiftsInBlocks[], i: number) => {
    const nextBlock: number = i + 1
    if (i + 1 <= allGifts.length - 1 && allGifts[i].startBlock - allGifts[nextBlock].endBlock > 2) {
      const fromBlock = allGifts[nextBlock].endBlock + 1
      const toBlock = allGifts[i].startBlock - 1

      return (
        <div>
          <Button 
            statusButton='idle'
            onClick={() => fetchGifts(fromBlock, toBlock)} 
          > 
          Search for gifts in blocks {fromBlock} to {toBlock} 
          </Button>
        </div>
      )
    }
  }

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
    if (settings && settings.fetchBlockAmount && blockNumberIsFetched && status == "idle") {
      const currentBlock: number = Number(blockNumber)
      let fromBlock = currentBlock < settings.fetchBlockAmount ? 0 : currentBlock - settings.fetchBlockAmount
  
      if (allGifts && allGifts[0].endBlock > fromBlock) { 
        fromBlock = allGifts[0].endBlock + 1
      }
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

            {allGifts?.map((gifts: GiftsInBlocks, i) => {
              return (
                <>
                {
                gifts.gifts.map((gift, j) => 
                  <GiftAvailable 
                  key = {j} 
                  address = {gift.address} 
                  name = {gift.name} 
                  symbol = {gift.symbol}
                  uri = {gift.uri} 
                  points = {gift.points}
                  additionalReq ={gift.additionalReq} 
                  metadata = {gift.metadata}
                  allowed = {allowedGifts && allowedGifts.includes(gift.address) ? true : false} 
                />
                )}
                { renderFetchButton(allGifts, i) }
                </>
              )
            })
          }  
          </section>
        </>
        : mode != "Available" && allowedGifts && allowedGifts.length > 0 ?
        <>          
          <section 
            className="flex flex-col h-full justify-start p-2 overflow-auto pb-20"
            >
            {allGifts?.map((gifts: GiftsInBlocks) => 
              gifts.gifts.map((gift, i) => 
                allowedGifts.includes(gift.address) ? 
                <GiftSelected 
                  key = {i} 
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
            message ={"No gifts found"}
            size = {1}
            align = {1}
          />
          </section>
        </>
        }
    </Layout>
  )
}