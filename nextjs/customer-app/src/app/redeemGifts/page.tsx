"use client"; 

import { Layout } from "@/components/Layout"
import { TitleText } from "@/components/StandardisedFonts"
import { GiftInfo } from "./RedeemGift";
import { useEffect, useState } from "react";
import { Gift } from "@/types";
import { useGifts } from "@/hooks/useGifts";

export default function Page() {
  const [mode, setMode] = useState<string>()
  const [savedGifts, setSavedGifts] = useState<Gift[]>([])
  const {status, gifts} = useGifts()
  
  console.log({
    status: status, 
    gifts: gifts
  })

  return (
    <Layout>  
      <TitleText title = "Gifts" size = {2} /> 
      
      <section className="flex flex-col divide-y justify-start p-2 overflow-auto">
        {gifts?.map(gift => 
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
        }
      </section>
    </Layout>
  )
}