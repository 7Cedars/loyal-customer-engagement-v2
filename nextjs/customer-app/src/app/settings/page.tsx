"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "../../components/StandardisedFonts"
import { SettingLayout } from "./SettingLayout"
import { useState } from "react"
import { ClearLocalStorage, Disclaimer, ShowProgramAddress, Logout, ShowCardAddress, ShowCardOwner } from "./SettingItems"

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<string>(); 
  console.log("selectedItem: ", selectedItem) 

  return (
    <Layout> 
      <TitleText title = "Settings" size = {2} /> 
      <div className="grow flex flex-col justify-start items-start overflow-auto p-2">
        <SettingLayout 
          selected = {selectedItem == 'localStore'} 
          onClick={() => selectedItem == 'localStore' ? setSelectedItem(undefined) : setSelectedItem('localStore') }
          titleText="Clear local storage"
          sizeFoldout={3}
          >
           <ClearLocalStorage/>
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'progAddress'} 
          onClick={() => selectedItem == 'progAddress' ? setSelectedItem(undefined) : setSelectedItem('progAddress') }
          titleText="Show program address"
          sizeFoldout={6}
          >
           <ShowProgramAddress /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'cardAddress'} 
          onClick={() => selectedItem == 'cardAddress' ? setSelectedItem(undefined) : setSelectedItem('cardAddress') }
          titleText="Show card address"
          sizeFoldout={6}
          >
           <ShowCardAddress /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'ownerAddress'} 
          onClick={() => selectedItem == 'ownerAddress' ? setSelectedItem(undefined) : setSelectedItem('ownerAddress') }
          titleText="Show card owner address"
          sizeFoldout={6}
          >
           <ShowCardOwner /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'disclaimer'} 
          onClick={() => selectedItem == 'disclaimer' ? setSelectedItem(undefined) : setSelectedItem('disclaimer') }
          titleText="Disclaimer"
          sizeFoldout={2}
          >
            <Disclaimer /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'logout'} 
          onClick={() => selectedItem == 'logout' ? setSelectedItem(undefined) : setSelectedItem('logout') }
          titleText="Exit program"
          sizeFoldout={3}
          >
           <Logout />
        </SettingLayout>

      </div>
    </Layout>
  )
}