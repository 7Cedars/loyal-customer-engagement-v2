"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "../../components/StandardisedFonts"
import { SettingLayout } from "./SettingLayout"
import { useState } from "react"
import { ChangeProgramImage, ClearLocalStorage, Disclaimer, ExitProgram, ShowProgramAddress } from "./SettingItems"

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
          sizeFoldout={1}
          >
           <ClearLocalStorage/>
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'progImage'} 
          onClick={() => selectedItem == 'progImage' ? setSelectedItem(undefined) : setSelectedItem('progImage') }
          titleText="Change program image"
          sizeFoldout={6}
          >
            <ChangeProgramImage />
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'progAddress'} 
          onClick={() => selectedItem == 'progAddress' ? setSelectedItem(undefined) : setSelectedItem('progAddress') }
          titleText="Show program address"
          sizeFoldout={5}
          >
           <ShowProgramAddress /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'creationCards'} 
          onClick={() => selectedItem == 'creationCards' ? setSelectedItem(undefined) : setSelectedItem('creationCards') }
          titleText="(Dis)allow creation loyalty cards"
          sizeFoldout={0}
          >
            <div>
            TO BE IMPLEMENTED 
            </div>
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'blockCard'} 
          onClick={() => selectedItem == 'blockCard' ? setSelectedItem(undefined) : setSelectedItem('blockCard') }
          titleText="Block loyalty card"
          sizeFoldout={0}
          >
            <div>
            TO BE IMPLEMENTED
            </div>
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'disclaimer'} 
          onClick={() => selectedItem == 'disclaimer' ? setSelectedItem(undefined) : setSelectedItem('disclaimer') }
          titleText="Disclaimer"
          sizeFoldout={0}
          >
            <Disclaimer /> 
        </SettingLayout>

        <SettingLayout 
          selected = {selectedItem == 'exit'} 
          onClick={() => selectedItem == 'exit' ? setSelectedItem(undefined) : setSelectedItem('exit') }
          titleText="Exit program"
          sizeFoldout={1}
          >
           <ExitProgram />
        </SettingLayout>

      </div>
    </Layout>
  )
}