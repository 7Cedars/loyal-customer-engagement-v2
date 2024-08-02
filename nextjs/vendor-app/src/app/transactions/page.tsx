"use client"

import { Layout } from "@/components/application/Layout"
import { InputBox } from "@/components/ui/InputBox"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { GiftInfo } from "../gifts/GiftInfo"
import useEvents from "@/hooks/useEvents"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
    // Number(await publicClient?.getBlockNumber
  const {status, events} = useEvents({fromBlock: BigInt(0), toBlock: BigInt(100)})

  console.log({
    status: status, 
    events: events
  })

  return (
    <Layout> 
      <TitleText title = "Transactions" size = {2} /> 

        <div className="w-full md:w-96 self-center"> 
          <InputBox nameId = {"SearchTransactions"} placeholder="Search transactions" /> 
        </div>
      
      <section 
        className="flex flex-col divide-y justify-start p-2 overflow-auto border border-red-500"
        style = {{color: prog.colourAccent}}
      >
        
      </section>
    </Layout>
  )
}