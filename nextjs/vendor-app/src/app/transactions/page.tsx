"use client"

import { Layout } from "@/components/application/Layout"
import { InputBox } from "@/components/ui/InputBox"
import { TitleText } from "@/components/ui/StandardisedFonts"
import useEvents from "@/hooks/useEvents"
import { useEffect } from "react"
import { useBlockNumber, useChainId } from 'wagmi'
import { chainSettings } from '../../context/chainSettings'
import { TransactionInfo } from "./TransactionInfo"

export default function Page() {
  const {status, error, fetchEvents, allEvents, fetchedEvents } = useEvents()
  const chainId = useChainId()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const settings = chainSettings(chainId)

  // fetch events for blocks that are newer than those already fetched 
  useEffect(() => {
    if (settings && settings.fetchBlockAmount && blockNumberIsFetched) {
      const currentBlock: number = Number(blockNumber)
      let fromBlock = currentBlock - settings.fetchBlockAmount
      if (allEvents && allEvents.endBlock > fromBlock) { 
        fromBlock = allEvents.endBlock + 1
      }
      // only fetch blocks if these are more than a minimum amount of blocks. 
      // avoids loop + unnecessary api calls. 
      if (currentBlock - fromBlock > settings.minimumBlocksToFetch) {
        fetchEvents(fromBlock, currentBlock) 
      }
    }
  }, [ blockNumberIsFetched, allEvents, blockNumber, fetchEvents, settings ])

  console.log({allEvents})

  return (
    <Layout> 
      <TitleText title = "Transactions" size = {2} /> 
      <section className="h-full flex flex-col">
        {/* <div className="w-full md:w-96 self-center pb-6"> 
          <InputBox nameId = {"SearchTransactions"} placeholder="Search transactions" /> 
        </div> */}
        <div className="flex flex-col h-full p-2 overflow-auto pb-20">
          {allEvents?.events?.map((item, i) => 
            <div key = {i}>
              <TransactionInfo event = {item}/>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}