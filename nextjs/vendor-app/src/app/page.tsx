"use client"; 

import { Button } from "./components/ui/Button";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Program } from "../types";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { DeployProgram } from "./DeployProgram";
import { useState } from "react";

export default function Home() {
  const { open } = useWeb3Modal()
  const { status, address } = useAccount()
  const [ mode, SetMode ] = useState<string>("deploy") // for testing purposes, should be "home" normally. 
  const {selectedProgram} = useAppSelector(state => state.selectedProgram) 
  let temp = localStorage.getItem("clp_v_programs")
  const savedPrograms: Program[] = temp ? JSON.parse(temp) : []

  // see https://blog.logrocket.com/storing-retrieving-javascript-objects-localstorage/ for explanation - it's super logical. 
  // localStorage.setItem("clp_v_programs", JSON.stringify(newProgram)); 
  // localStorage.setItem("colourAccent", "#1d4ed8"); 

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
        <DeployProgram /> 
        <div className="w-full p-2"> 
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
