"use client"; 

import { Button } from "./components/ui/Button";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ChangeEvent, useEffect, useState } from "react";
import EmblaCarousel from './components/ui/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import { Program } from "../types";
import { HexColorPicker } from "react-colorful";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { NoteText, TitleText } from "./components/ui/StandardisedFonts";
import { InputBox } from "./components/ui/InputBox";
import { TabChoice } from "./components/ui/TabChoice";

export default function Home() {
  const { open } = useWeb3Modal()
  const { status, address } = useAccount()
  const [ mode, SetMode ] = useState<string>("deploy") // for testing purposes, should be "home" normally. 
  const [ name, setName ] = useState<string | undefined>() // "Hastings Hope" 
  const [ base, setBase ] = useState<string | undefined>() // "#2f4632" 
  const [ accent, setAccent ] = useState<string | undefined>() // "#a9b9e8" 
  const [ uri, setUri ] = useState<string>("") 
  const [ tab, setTab ] = useState<string>("Base") 
  const {selectedProgram} = useAppSelector(state => state.selectedProgram) 
  let temp = localStorage.getItem("clp_v_programs")
  const savedPrograms: Program[] = temp ? JSON.parse(temp) : []

  console.log("name:", name)
  // see https://blog.logrocket.com/storing-retrieving-javascript-objects-localstorage/ for explanation - it's super logical. 
  // localStorage.setItem("clp_v_programs", JSON.stringify(newProgram)); 
  // localStorage.setItem("colourAccent", "#1d4ed8"); 

  const OPTIONS: EmblaOptionsType = {}
  
  const nameProgram: React.JSX.Element = (
    <>
      <div>
        <TitleText 
          title = "Program name"
          subtitle = "Add a name for your program."
          size = {1} 
          /> 
        
        <NoteText 
          message = "Required. This name CANNOT be changed after deployment."
          size = {0}
          /> 
      </div>

      <InputBox
        nameId = "name"
        placeholder={"Enter a name here."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} // this needs a parser.... 
      />

      <div />  
    </>
  )

  const colourProgram: React.JSX.Element = (
    <>
      <TitleText 
        title = "Colour picker"
        subtitle = "Choose the colour scheme of your program."
        size = {1} 
        /> 
      
      <NoteText 
        message = "Required. The colour scheme can be changed after deployment."
        size = {0}
        /> 

      <TabChoice 
        optionOne = "Base"
        optionTwo = "Accent"
        onChange={(choice) => setTab(choice) }
      />

      <section className="responsive-width p-2">
        <HexColorPicker color={
          tab == "Base" ? 
            base == undefined ? "#2f4632" : base 
            :
            accent == undefined ? "#a9b9e8" : accent
        }
        onChange={tab == "Base" ? setBase : setAccent} />
      </section>

      <section className="w-full h-fit p-2">
        <div 
          className="grid grid-cols-1 text-md text-center border content-center rounded-lg p-2 h-12"
          style = {{
            color: accent == undefined ? "#a9b9e8" : accent, 
            borderColor: accent == undefined ? "#a9b9e8" : accent, 
            backgroundColor: base == undefined ? "#2f4632" : base 
          }} 
          > 
          {name}
        </div>
      </section>
    </>
  )

  const uriProgram: React.JSX.Element = (
    <> 
      <div> 
        <TitleText 
          title = "Program image"
          subtitle = "Choose an image of your program."
          size = {1} 
          /> 
        
        <NoteText 
          message = "Optional. The image can be changed after deployment."
          size = {0}
          /> 
      </div>
      <section className="h-fit w-full grid grid-cols-1 p-2 place-items-center content-center">
        <div 
          className="w-fit h-fit text-md text-center border-4 rounded-lg p-6"
          style = {{
            color: accent == undefined ? "#a9b9e8" : accent, 
            borderColor: accent == undefined ? "#a9b9e8" : accent, 
            backgroundColor: base == undefined ? "#2f4632" : base 
          }} 
          >
          <Image
              className="w-full"
              width={100}
              height={100}
              style = {{ objectFit: "fill" }} 
              src={"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}
              alt="No valid image detected."
            />
        </div>
      </section>

      <InputBox
        nameId = "uri"
        placeholder={"Enter a uri (https://...) to an image."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => setUri(event.target.value)} // this needs a parser.... 
      />   
    </> 
  )
  // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"

  const SLIDES = [nameProgram, colourProgram, uriProgram]
  
  return (
    <main className="flex flex-col w-full h-dvh bg-slate-100 dark:bg-slate-900 place-content-center items-center">
      <div className={`h-fit grid grid-cols-1 justify-items-center max-w-lg max-w-3xl md:w-4/5`}>
      {
      mode == "home" ? 
      <>
        <div className={`w-full min-h-[50vh] grid grid-cols-1 content-between place-items-center max-w-lg gap-4 p-2`}>
          <div></div>
          <div className="w-full self-center"> 
            <div className={`w-full grid grid-cols-1 text-3xl text-center pb-8`}> 
                hi there! this is loyal
            </div>  
            {/* <div className={`w-full grid grid-cols-1 text-3xl text-center pb-8`}> 
                this is Loyal.
            </div>  */}
            <div className="grid grid-cols-1 content-between place-items-center"> 
              <Image
                className="self-center rounded-t-lg text-center"
                width={80}
                height={80}
                src={"/logo.png"}
                alt="Logo"
              />
            </div>
            {/* <Image src="/public/iconLoyaltyProgram.png" alt="Logo" width="100" height="100" /> */}
            <div className={`w-full grid grid-cols-1 text-sm text-center pt-8`}> 
              A lightweight, composable, app for customer engagement programs.   
            </div> 
          </div> 
          
          <Button onClick = {() => {open()}}  >
            {
              status == "connected" ? 
              `Connected at: ${address.slice(0,6)}...${address.slice(38,42)}`
              :
              "Connect wallet"
            }
          </Button>
        </div>
        <div 
          className={`w-full grow aria-disabled:grow-0 h-fit aria-disabled:h-2 aria-disabled:opacity-0 opacity-100 transition:all ease-in-out duration-300 delay-700 grid grid-cols-1 max-w-lg gap-4 px-2`}
          aria-disabled={status != "connected"}
          >
          {/* <Button  customColours = {dummyData[0].bgColour + dummyData[0].textColour + dummyData[0].borderColour}>
            {dummyData[0].name}
          </Button>
          <Button  customColours = {dummyData[1].bgColour + dummyData[1].textColour + dummyData[1].borderColour}>
            {dummyData[1].name}
          </Button> */}
          <Button 
            onClick = {() => {SetMode("deploy") }}
            >
            Deploy new program
          </Button>
        </div>
      </>
      :
      <>
        <div className={`w-full h-[50vh] flex flex-col content-center max-w-lg gap-4 p-2`}> 
          <EmblaCarousel slides={SLIDES} options={OPTIONS} />
        </div>
        <div className={`w-full h-fit grid grid-cols-1 max-w-lg gap-4 px-2`}>
          <Button 
            onClick = {() => {}}
            // £ CONTINUE HERE 
            // disabled={}
            >
            Deploy
          </Button>
          <Button 
            onClick = {() => {SetMode("home") }}
            >
            Back
          </Button>
        </div>
      </>
    }
    </div>
  </main> 
  )
}
