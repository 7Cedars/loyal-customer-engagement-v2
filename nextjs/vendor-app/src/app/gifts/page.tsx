"use client"; 

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { GiftInfo } from "./Gift";
import { InputBox } from "@/components/ui/InputBox";
import { TabChoice } from "@/components/ui/TabChoice";
import { useState } from "react";

export default function Page() {
  const [mode, setMode] = useState<string>()

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
        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}
            description = {"Take a free tour of our shop in the UK! Maybe here add a caveat." } 
            claim = {"This is a dummy claim requirement description. This description can be nice and lengthy without any problem."}
            redeem = {"This is a dummy redeem requirement description. This description can be nice and lengthy without any problem."}  
        />
        
        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}
            description = {"Take a free tour of our shop in the UK! Maybe here add a caveat." } 
            claim = {"This is a dummy claim requirement description. This description can be nice and lengthy without any problem."}
            redeem = {"This is a dummy redeem requirement description. This description can be nice and lengthy without any problem."}  
        />
        
        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}
            description = {"Take a free tour of our shop in the UK! Maybe here add a caveat." } 
            claim = {"This is a dummy claim requirement description. This description can be nice and lengthy without any problem."}
            redeem = {"This is a dummy redeem requirement description. This description can be nice and lengthy without any problem."}  
        />
        
      
        
        
      </section>
    </Layout>
  )
}