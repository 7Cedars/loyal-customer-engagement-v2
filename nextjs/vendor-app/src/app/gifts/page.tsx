"use client"; 

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { GiftInfo } from "./GiftInfo";
import { InputBox } from "@/components/ui/InputBox";
import { TabChoice } from "@/components/ui/TabChoice";
import { useEffect, useState } from "react";
import { Gift } from "@/types";
import { useGifts } from "@/hooks/useGifts";
import { Button } from "@/components/ui/Button";

export default function Page() {
  const [mode, setMode] = useState<string>()
  const [savedGifts, setSavedGifts] = useState<Gift[]>([])
  const {status, gifts, fetchGifts} = useGifts()
  
  console.log({
    status: status, 
    gifts: gifts
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
      
      <section className="flex flex-col divide-y justify-start p-2 overflow-auto">

        <Button onClick={() => {fetchGifts(0, 995)}}>
          Press here to test
        </Button>
        {/* {gifts?.map(gift => 
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
          )
        } */}
      </section>
    </Layout>
  )
}