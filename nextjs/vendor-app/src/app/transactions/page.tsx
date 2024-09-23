"use client"

import { Layout } from "@/components/application/Layout"
import { InputBox } from "@/components/ui/InputBox"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { GiftInfo } from "../gifts/GiftInfo"
import useEvents from "@/hooks/useEvents"
import { Button } from "@/components/ui/Button"
import { useEffect } from "react"
import { useBlockNumber, useChainId } from 'wagmi'
import { chainSettings } from '../../context/chainSettings'
import { TransactionInfo } from "./TransactionInfo"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {status, error, fetchEvents, allEvents, fetchedEvents } = useEvents()
  const chainId = useChainId()
  const {data: blockNumber, isFetched: blockNumberIsFetched} = useBlockNumber()
  const settings = chainSettings(chainId)

  useEffect(() => {
    if (settings && settings.fetchBlockAmount && blockNumberIsFetched) {
      const currentBlock: number = Number(blockNumber)
      let fromBlock = currentBlock - settings.fetchBlockAmount
      if (allEvents && allEvents.endBlock > fromBlock) { 
        fromBlock = allEvents.endBlock + 1
      }
      if (currentBlock - fromBlock > settings.minimumBlocksToFetch) {
        fetchEvents(fromBlock, currentBlock) 
      }
    }
  }, [ blockNumberIsFetched, allEvents, blockNumber, fetchEvents, settings ])

  return (
    <Layout> 
      <TitleText title = "Transactions" size = {2} /> 
      <section className="flex flex-col p-4">
        <div className="w-full md:w-96 self-center pb-6"> 
          <InputBox nameId = {"SearchTransactions"} placeholder="Search transactions" /> 
        </div>
        <div className="flex flex-col overflow-auto">
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