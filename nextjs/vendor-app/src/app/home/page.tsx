"use client"; 

import { Layout } from "@/components/application/Layout";
import { Button } from "@/components/ui/Button";
import { TitleText } from "@/components/ui/StandardisedFonts";
import { TabChoice } from "@/components/ui/TabChoice";
import { useAppSelector } from "@/redux/hooks";
import { useBalance } from 'wagmi'
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from "react";
import { TransferFunds } from "./TransferFunds";
import { setBalanceProgram } from "@/redux/reducers/programReducer";
import { useDispatch } from "react-redux";
import { GivePoints } from "./GivePoints";
import { RedeemGifts } from "./RedeemGift";
import { parseImageUri } from "@/utils/parsers";
import Image from "next/image";
import { useScreenDimensions } from "@/hooks/useScreenDimensions";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [mode, setMode]  = useState<string | undefined>()
  const [transferMode, setTransferMode] = useState<boolean>(false)
  const [uri, setUri] = useState<string>("")
  const {data: balanceData, refetch, fetchStatus} = useBalance({ address: prog.address })
  const dimensions = useScreenDimensions()
  const dispatch = useDispatch() 

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

  const checkImageUri = useCallback( 
    async (uri:string) => {
      const parsedURI = await parseImageUri(uri)
      setUri(parsedURI)
    }, []
  )

  // checking image uri. 
  useEffect(() => {
    if (prog && prog.uriImage) 
      checkImageUri(prog.uriImage)
  }, [prog, checkImageUri])

  return (
    <Layout> 
      <TitleText 
        title = {prog.name ? prog.name : "Home"} 
        subtitle={prog.balance == undefined ? `Fetching balance...`:`Balance: ${prog.balance.toFixed(6)} eth` } 
        size = {2} 
        /> 
      <div className="grow flex flex-col justify-center items-center">
        <div className="w-full sm:w-4/5 lg:w-1/2 h-fit p-2 mt-6">
          <Button 
            statusButton="idle"
            onClick={() => {
            setTransferMode(!transferMode)
            setMode(undefined)
            }}>
            Transfer eth
          </Button>
        </div>
        <section 
          className="h-full w-full flex flex-col justify-center items-center mb-16 md:mb-0">
          
          <div 
            className="grow-0 opacity-0 aria-selected:grow aria-selected:opacity-100 transition:all ease-in-out duration-300 delay-300 h-2"
            aria-selected={mode == undefined} 
            style = {mode == undefined ? {} : {pointerEvents: "none"}}
            >
            <div className="w-full h-full grid grid-cols-1 content-center "> 
              {transferMode ? 
                <div className="w-full h-full flex flex-col">
                  <TransferFunds/>
                  <div className="w-full h-full p-1">
                    <Button 
                      statusButton="idle"
                      onClick = {() => {setTransferMode(false)}}
                      >
                      Back
                    </Button>
                  </div> 
                </div>
                :
                uri.length > 0 ? 
                <> 
                  <div className="w-full flex justify-center">
                  <Image
                      className="w-1/2"
                      // fill
                      width={dimensions.width}
                      height={dimensions.height}
                      style = {{ objectFit: "fill" }} 
                      src={uri}
                      alt="No valid image detected."
                      onError={(e) => console.log(e)}
                    /> 
                  </div>
                </>
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
          <div 
            className="flex flex-col w-full justify-between items-center h-14 border border-b-0 z-10 aria-selected:z-0 rounded-t-full"
            aria-selected={mode != undefined} 
            style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
            >
            <div 
              className="flex flex-row justify-between items-center w-full m-1"
              style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
              >
                <button 
                  className="grow h-full"
                  onClick={() => mode == undefined? setMode("Give Points") : setMode(undefined)} > 
                </button>     
                <div className="max-w-7xl w-1/2">
                  <TabChoice 
                    optionOne = "Give Points" 
                    optionTwo = "Redeem Gift" 
                    initialChoice = {mode == "Give Points" ? 0 : 1}
                    onChange={(target) => {target == mode ? setMode(undefined) : setMode(target)}}
                    />
                </div>
                <button 
                  className="grow h-full"
                  onClick={() => mode == undefined? setMode("Give Points") : setMode(undefined)} > 
                </button> 
            </div>
          </div>
        
          <div 
            className="flex flex-col items-center justify-center grow-0 w-full opacity-0 aria-selected:opacity-100 aria-selected:grow transition:all ease-in-out duration-300 delay-300 h-2 border-x"
            aria-selected={mode != undefined} 
            // style={{borderColor: prog.colourAccent}}
            style = {mode != undefined ? {borderColor: prog.colourAccent} : {borderColor: prog.colourAccent, pointerEvents: "none"}}
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