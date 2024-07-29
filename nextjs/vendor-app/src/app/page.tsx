"use client"; 

import { Button } from "./components/ui/Button";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useState } from "react";
import EmblaCarousel from './components/ui/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import { Program } from "../../types";

export default function Home() {
  const { open } = useWeb3Modal()
  const { status, address } = useAccount() 
  const [ mode, SetMode ] = useState<string>("home")
  const [ newProgram, setNewProrgram] = useState<Program>({
    name: "", textColour: "", borderColour: "", bgColour: "", imgUri: "" 
  }); 
  let temp = localStorage.getItem("clp_v_programs")
  const savedPrograms: Program[] = temp ? JSON.parse(temp) : []

  // see https://blog.logrocket.com/storing-retrieving-javascript-objects-localstorage/ for explanation - it's super logical. 
  localStorage.setItem("clp_v_programs", JSON.stringify(newProgram)); 

  const OPTIONS: EmblaOptionsType = {}
  
  const nameProgram: React.JSX.Element = (
    <div key = {1}> 
      Here add name 
    </div> 
  )

  const colourProgram: React.JSX.Element = (
    <div key = {1}> 
      Here pick colour scheme program.  
    </div> 
  )

  const uriProgram: React.JSX.Element = (
    <div key = {1}> 
      Here add uri program.  
    </div> 
  )

  const SLIDES = [nameProgram, colourProgram, uriProgram]
  
  return (
    <main className="flex flex-col w-full h-dvh bg-slate-100 dark:bg-slate-900 place-content-center items-center">
      {
      mode == "home" ? 
      <>
        <div className={`h-fit grid grid-cols-1 justify-items-center max-w-lg max-w-3xl md:w-4/5`}>
          <div className={`w-full h-fit grid grid-cols-2 gap-4 h-48 p-2 pb-12`}>
            <div className={`w-fit place-self-start`}> 
              About
            </div> 
            <div className={`w-fit place-self-end`}>
              Toggle
            </div> 
          </div>
        
        <div className={`w-full h-[30vh] grid grid-cols-1 content-center max-w-lg gap-4 h-48 p-2`}>
          <div className={`w-full grid grid-cols-1 text-3xl `}> 
              hi there!
          </div> 
          <div className={`w-full grid grid-cols-1 text-3xl text-end`}> 
              this is Loyal 
          </div> 
          <div className={`w-full grid grid-cols-1 text-sm text-center pb-20`}> 
              A lightweight, composable, app for customer engagement programs.   
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
            customColours = {`bg-slate-100 text-slate-900 border-slate-900`}
            onClick = {() => {SetMode("deploy") }}
            >
            Deploy new program
          </Button>
        </div>

        </div>
      </>
      :
      <div className={`h-fit grid grid-cols-1 justify-items-center max-w-lg max-w-3xl md:w-4/5 border border-green-500`}> 
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>
    }
    </main> 
  )

}
