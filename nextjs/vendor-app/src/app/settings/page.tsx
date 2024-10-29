"use client"

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { SettingLayout } from "./SettingLayout"
import { useState } from "react"
import { ChangeProgramImage, ClearLocalStorage, Disclaimer, ExitProgram, ShowProgramAddress, ShowProgramOwner } from "./SettingItems"

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<string>(); 

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
          sizeFoldout={6}
          >
           <ShowProgramAddress /> 
        </SettingLayout>

        {/* <SettingLayout 
          selected = {selectedItem == 'progOwner'} 
          onClick={() => selectedItem == 'progOwner' ? setSelectedItem(undefined) : setSelectedItem('progOwner') }
          titleText="Show program owner address"
          sizeFoldout={5}
          >
           <ShowProgramOwner /> 
        </SettingLayout> */}

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
          sizeFoldout={2}
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