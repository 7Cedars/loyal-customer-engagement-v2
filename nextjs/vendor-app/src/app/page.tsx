"use client"; 

import { Button } from "../components/ui/Button";
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Program } from "../types";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { DeployProgram } from "./DeployProgram";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { useDispatch } from "react-redux";
import { resetProgram, setProgram } from "@/redux/reducers/programReducer";
import { Hex } from "viem";

export default function Home() {
  // FOR DEV ONLY // 
  // const programsForLocalStorage: Program[] = [{ 
  //   address: "0x82b6311bDC316636Af8546891A380333a3CE0B8E", 
  //   name: "Highstreet Hopes",
  //   colourBase: "#3d5769",
  //   colourAccent: "#c8cf0c", 
  //   uriImage: "" 
  // }]
  // localStorage.setItem("clp_v_programs", JSON.stringify(programsForLocalStorage)); 
  // FOR DEV ONLY // 

  const { open } = useWeb3Modal()
  const { status, address } = useAccount()
  const [ mode, SetMode ] = useState<string>("home")  
  const router = useRouter()
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([]); 
  const dispatch = useDispatch() 

  useEffect(()=>{
    let localStore = localStorage.getItem("clp_v_programs")
    const saved: Program[] = localStore ? JSON.parse(localStore) : []
    setSavedPrograms(saved)
    dispatch(resetProgram(true)) 
  }, [, mode])

  const handleSelectionProgram = (program: Program) => {
    dispatch(setProgram({
      address: program.address, 
      name: program.name, 
      colourBase: program.colourBase, 
      colourAccent: program.colourAccent,
      uriImage: program.uriImage
    }))
    router.push('/home')
  }

  const handleRemoveProgram = (address: Hex | undefined) => {
    const filteredPrograms = savedPrograms.filter((program) => program.address != address)
    setSavedPrograms(filteredPrograms)
    localStorage.setItem("clp_v_programs", JSON.stringify(filteredPrograms)); 
  }

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
            <div className="grid grid-cols-1 content-between place-items-center"> 
              <Image
                className="self-center rounded-t-lg text-center"
                width={80}
                height={80}
                src={"/logo.png"}
                alt="Logo"
              />
            </div>
            <div className={`w-full grid grid-cols-1 text-sm text-center pt-8`}> 
              A lightweight modular dApp for customer engagement programs.   
            </div> 
          </div> 
          
          <div className="mb-2 w-full"> 
          <Button onClick = {() => {open()}}  >
            {
              status == "connected" ? 
              `Connected at: ${address.slice(0,6)}...${address.slice(38,42)}`
              :
              "Connect wallet"
            }
          </Button>
          </div>
        </div>
        <div 
          className={`w-full grow aria-disabled:grow-0 h-fit aria-disabled:h-2 aria-disabled:opacity-0 opacity-100 transition:all ease-in-out duration-300 delay-700 grid grid-cols-1 max-w-lg gap-4 px-2`}
          aria-disabled={status != "connected"}
          >
          { 
            savedPrograms.length > 0 ? 
              savedPrograms.map((program, i) => 
                <>
                  <div 
                    key = {i} 
                    className={`relative w-full h-full flex flex-row disabled:opacity-50 text-md text-center border content-center rounded-lg p-2 mt-0 h-12`} 
                    style = {{
                      color: program.colourAccent, 
                      borderColor: program.colourAccent, 
                      backgroundColor: program.colourBase
                    }} 
                    >
                    <button 
                      className="grow" 
                      onClick={() => handleSelectionProgram(program)}>
                      {program.name}
                    </button>
                    <div 
                      className="grid grid-cols-1 items-center absolute inset-y-0 right-0 hover:opacity-100 opacity-0">
                      <button onClick={() => handleRemoveProgram(program.address)}>
                        <XMarkIcon
                          className={"h-6 w-6 mx-2"}
                          style={{color: program.colourAccent}}
                        />
                      </button>
                    </div>
                  </div>
                </>
                )
                : 
                null 
          }
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
