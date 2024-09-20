"use client"

import { Layout } from "@/components/application/Layout"
import { InputBox } from "@/components/ui/InputBox"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { GiftInfo } from "../gifts/GiftInfo"
import useEvents from "@/hooks/useEvents"
import { Button } from "@/components/ui/Button"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
    // Number(await publicClient?.getBlockNumber
  const {status, error, fetchEvents, allEvents, fetchedEvents } = useEvents(); 

  console.log({
    status: status,
    allEvents: allEvents, 
    fetchedEvents: fetchedEvents
  })

  return (
    <Layout> 
      <TitleText title = "Transactions" size = {2} /> 

        <div className="w-full md:w-96 self-center"> 
          <InputBox nameId = {"SearchTransactions"} placeholder="Search transactions" /> 
        </div>
        <Button onClick={() => {fetchEvents(0, 2300)}}>
          Press here to test fetch events
        </Button>
        
      
      <section 
        className="flex flex-col divide-y justify-start p-2 overflow-auto border border-red-500"
        style = {{color: prog.colourAccent}}
      >
        
      </section>
    </Layout>
  )
}