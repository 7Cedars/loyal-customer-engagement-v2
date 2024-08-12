"use client"; 

import { Layout } from "@/components/application/Layout";
import { Button } from "@/components/ui/Button";
import { TitleText } from "@/components/ui/StandardisedFonts";
import { TabChoice } from "@/components/ui/TabChoice";
import { useAppSelector } from "@/redux/hooks";
import { useBalance } from 'wagmi'
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";
import { TransferFunds } from "./TransferFunds";
import { setBalanceProgram } from "@/redux/reducers/programReducer";
import { useDispatch } from "react-redux";
import { GivePoints } from "./GivePoints";
import { RedeemGifts } from "./RedeemGift";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [mode, setMode]  = useState<string | undefined>()
  const [transferMode, setTransferMode] = useState<boolean>(false)
  const {data: balanceData, refetch, fetchStatus} = useBalance({ address: prog.address })
  const dispatch = useDispatch() 

  console.log("prog.address:", prog.address)
  console.log("balanceData:", balanceData)
  console.log("prog.balance:", prog.balance)

  // updating balance of program. 
  useEffect(() => {
    if (
      balanceData && 
      balanceData.decimals && 
      Number(balanceData?.value) / 10 ** balanceData?.decimals != prog.balance) 
      {
        dispatch(setBalanceProgram(Number(balanceData?.value) / 10 ** balanceData?.decimals))  
      }
  }, [balanceData, prog, dispatch])

  return (
    <Layout> 
      <TitleText title = {prog.name ? prog.name : "Home"} size = {2} /> 
      <div className="grow flex flex-col justify-start items-center">
        <div className="w-full sm:w-4/5 lg:w-1/2 h-12 p-2">
          <Button onClick={() => {setTransferMode(true)}}>
            {prog.balance == undefined ? `Fetching balance...`:`Balance: ${prog.balance} Eth` } 
          </Button>
        </div>
        <section 
          className="h-full w-full flex flex-col justify-start items-center mb-16 md:mb-0">
          
          <div 
            className="grow-0 opacity-0 aria-selected:grow aria-selected:opacity-100 transition:all ease-in-out duration-300 delay-300 h-2"
            aria-selected={mode == undefined} 
            >
            <div className="w-full h-full grid grid-cols-1 content-center "> 
              {transferMode ? 
                <div className="w-full h-full flex flex-col">
                  <TransferFunds/>
                  <div className="w-full h-full p-1">
                    <Button onClick = {() => {setTransferMode(false)}}>
                      Back
                    </Button>
                  </div> 
                </div>
                :
                <>
                  <div
                    className={`w-full grid grid-cols-1 text-3xl text-center p-4`}
                    style={{color: prog.colourAccent}}
                    > 
                    hi there! this is loyal
                  </div>  
                  <div 
                    className={`w-full grid grid-cols-1 text-sm text-center`}
                    style={{color: prog.colourAccent}}
                    > 
                    A lightweight, composable, app for customer engagement programs.   
                  </div> 
                </>
              }
            </div> 
          </div>

          {/* Top bar, always visible */}
          <section 
            className="z-10 h-12 flex flex-row justify-between items-center w-full border rounded-t-full"
            style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
            >
               <button onClick={() => mode == undefined? setMode("Give Points") : setMode(undefined)} > 
                  <div 
                  className="ms-8 h-8 w-8 rotate-180 aria-selected:rotate-0 transition:all ease-in-out duration-300 delay-300"
                  aria-selected={mode == undefined} 
                  > 
                  <ChevronUpIcon
                    className={""}
                    style={{color:prog.colourAccent}}
                  />
                  </div> 
                </button>     
              <div className="max-w-7xl w-1/2">
                <TabChoice 
                  optionOne = "Give Points" 
                  optionTwo = "Redeem Gift" 
                  onChange={(target) => {setMode(target)}}
                  />
              </div>
              {/* empty box to help with outline */}
              <div className="me-8 h-8 w-8" >  
            </div>
          </section>

          
          <div 
            className="flex flex-col grow-0 w-full opacity-0 aria-selected:opacity-100 aria-selected:grow transition:all ease-in-out duration-300 delay-300 h-2 border-x"
            aria-selected={mode != undefined} 
            style={{borderColor: prog.colourAccent}}
          > 
            {
              mode == 'Give Points' ?
              <GivePoints />  
              : 
              <RedeemGifts /> 
            }
          </div> 
        </section>
      </div>
    </Layout>
  )
}