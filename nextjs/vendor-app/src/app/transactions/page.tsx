"use client"

import { Layout } from "@/components/application/Layout"
import { InputBox } from "@/components/ui/InputBox"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { GiftInfo } from "../gifts/Gift"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

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

        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}  
            claim = {"This is a dummy claim requirement description."}
            redeem = {"This is a dummy redeem requirement description."}  
        />
        
        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}  
            claim = {"This is a dummy claim requirement description."}
            redeem = {"This is a dummy redeem requirement description."}  
        />

        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}  
            claim = {"This is a dummy claim requirement description."}
            redeem = {"This is a dummy redeem requirement description."}  
        />

        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}  
            claim = {"This is a dummy claim requirement description."}
            redeem = {"This is a dummy redeem requirement description."}  
        />

        <GiftInfo 
            imageUri = {"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}  
            title = {"This is a test gift"}  
            points = {2500}  
            claim = {"This is a dummy claim requirement description."}
            redeem = {"This is a dummy redeem requirement description."}  
        />


      </section>
    </Layout>
  )
}