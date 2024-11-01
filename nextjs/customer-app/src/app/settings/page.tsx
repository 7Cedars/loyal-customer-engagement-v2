"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "../../components/StandardisedFonts"
import { Foldout } from "../../components/Foldout"
import { useState } from "react"
import { ClearLocalStorage, Disclaimer, ShowProgramAddress, Logout, ShowCardAddress, ShowCardOwner, ExportWalletKey, AboutSection } from "./SettingItems"

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<string>(); 

  return (
    <Layout> 
      <TitleText title = "Settings" size = {2} /> 
      <div className="grow flex flex-col justify-start items-start overflow-auto p-2">

      <Foldout 
          selected = {selectedItem == 'exportKey'} 
          onClick={() => selectedItem == 'exportKey' ? setSelectedItem(undefined) : setSelectedItem('exportKey') }
          titleText="Export wallet key"
          sizeFoldout={3}
          >
           <ExportWalletKey /> 
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'localStore'} 
          onClick={() => selectedItem == 'localStore' ? setSelectedItem(undefined) : setSelectedItem('localStore') }
          titleText="Clear local storage"
          sizeFoldout={3}
          >
           <ClearLocalStorage/>
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'progAddress'} 
          onClick={() => selectedItem == 'progAddress' ? setSelectedItem(undefined) : setSelectedItem('progAddress') }
          titleText="Show program address"
          sizeFoldout={6}
          >
           <ShowProgramAddress /> 
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'cardAddress'} 
          onClick={() => selectedItem == 'cardAddress' ? setSelectedItem(undefined) : setSelectedItem('cardAddress') }
          titleText="Show card address"
          sizeFoldout={6}
          >
           <ShowCardAddress /> 
        </Foldout>

        <Foldout 
          selected = {selectedItem == 'ownerAddress'} 
          onClick={() => selectedItem == 'ownerAddress' ? setSelectedItem(undefined) : setSelectedItem('ownerAddress') }
          titleText="Show card owner address"
          sizeFoldout={6}
          >
           <ShowCardOwner /> 
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
          selected = {selectedItem == 'logout'} 
          onClick={() => selectedItem == 'logout' ? setSelectedItem(undefined) : setSelectedItem('logout') }
          titleText="Exit program"
          sizeFoldout={3}
          >
           <Logout />
        </Foldout>

      </div>
    </Layout>
  )
}