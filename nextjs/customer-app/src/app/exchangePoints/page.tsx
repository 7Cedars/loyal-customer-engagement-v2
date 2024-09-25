"use client"; 

import { Layout } from "@/components/Layout"
import { TitleText } from "@/components/StandardisedFonts"
import { GiftInfo } from "./GiftInfo";
import { useEffect, useState } from "react";
import { Gift } from "@/types";
import { useGifts } from "@/hooks/useGifts";
import { useAppSelector } from "@/redux/hooks";
import { useReadContract } from "wagmi";
import { loyaltyProgramAbi } from "@/context/abi";

export default function Page() {
  const [mode, setMode] = useState<string>()
  const [savedGifts, setSavedGifts] = useState<Gift[]>([])
  const {status, gifts, fetchGifts} = useGifts()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  useEffect(() => {
    if (prog) {
      fetchGifts() 
    }
  }, [prog, fetchGifts])

  console.log({gifts})

  return (
    <Layout>  
      <TitleText title = "Gifts" size = {2} /> 

      <section className="flex flex-col justify-start p-2 overflow-auto h-full">
        {gifts?.map(gift => 
          <GiftInfo 
            key = {gift.address} 
            address = {gift.address} 
            name = {gift.name} 
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