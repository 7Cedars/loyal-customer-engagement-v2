"use client"

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { SettingItem } from "./SettingItem"
import { useState } from "react"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [selectedItem, setSelectedItem] = useState<string>(); 
  console.log("selectedItem: ", selectedItem) 

  return (
    <Layout> 
      <TitleText title = "Settings" size = {2} /> 
      <div className="grow flex flex-col items-center p-2 border border-red-500">
        This is the settings page
        <SettingItem 
          selected = {selectedItem == 'test'} 
          onClick={() => setSelectedItem('test')}
          titleText="This is a test"
          >
            <div>
            THIS CAN BE ANYTHING  
            </div>
          
        </SettingItem>
      </div>
    </Layout>
  )
}