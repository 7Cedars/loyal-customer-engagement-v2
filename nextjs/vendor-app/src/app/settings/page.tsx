"use client"

import { Layout } from "@/components/application/Layout"
import { TitleText } from "@/components/ui/StandardisedFonts"
import { Foldout } from "../../components/application/Foldout"
import { useState } from "react"
import { AboutSection, ChangeProgramImage, ClearLocalStorage, Disclaimer, ExitProgram, ShowProgramAddress, ShowProgramOwner } from "./SettingItems"

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<string>(); 

  return (
    <Layout> 
      <TitleText title = "Settings" size = {2} /> 
      <div className="grow flex flex-col justify-start items-start overflow-auto p-2">
        <Foldout 
          selected = {selectedItem == 'localStore'} 
          onClick={() => selectedItem == 'localStore' ? setSelectedItem(undefined) : setSelectedItem('localStore') }
          titleText="Clear local storage"
          sizeFoldout={3}
          >
           <ClearLocalStorage/>
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'progImage'} 
          onClick={() => selectedItem == 'progImage' ? setSelectedItem(undefined) : setSelectedItem('progImage') }
          titleText="Change program image"
          sizeFoldout={6}
          >
            <ChangeProgramImage />
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'progAddress'} 
          onClick={() => selectedItem == 'progAddress' ? setSelectedItem(undefined) : setSelectedItem('progAddress') }
          titleText="Show program address"
          sizeFoldout={6}
          >
           <ShowProgramAddress /> 
        </Foldout>

        {/* <Foldout 
          selected = {selectedItem == 'progOwner'} 
          onClick={() => selectedItem == 'progOwner' ? setSelectedItem(undefined) : setSelectedItem('progOwner') }
          titleText="Show program owner address"
          sizeFoldout={5}
          >
           <ShowProgramOwner /> 
        </Foldout> */}

        <Foldout 
          selected = {selectedItem == 'creationCards'} 
          onClick={() => selectedItem == 'creationCards' ? setSelectedItem(undefined) : setSelectedItem('creationCards') }
          titleText="(Dis)allow creation loyalty cards"
          sizeFoldout={0}
          >
            <div>
            TO BE IMPLEMENTED 
            </div>
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'blockCard'} 
          onClick={() => selectedItem == 'blockCard' ? setSelectedItem(undefined) : setSelectedItem('blockCard') }
          titleText="Block loyalty card"
          sizeFoldout={0}
          >
            <div>
            TO BE IMPLEMENTED
            </div>
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'about'} 
          onClick={() => selectedItem == 'about' ? setSelectedItem(undefined) : setSelectedItem('about') }
          titleText="About"
          sizeFoldout={2}
          >
            <AboutSection /> 
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'disclaimer'} 
          onClick={() => selectedItem == 'disclaimer' ? setSelectedItem(undefined) : setSelectedItem('disclaimer') }
          titleText="Disclaimer"
          sizeFoldout={2}
          >
            <Disclaimer /> 
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'exit'} 
          onClick={() => selectedItem == 'exit' ? setSelectedItem(undefined) : setSelectedItem('exit') }
          titleText="Exit program"
          sizeFoldout={1}
          >
           <ExitProgram />
        </Foldout>

      </div>
    </Layout>
  )
}