"use client"; 

import { Layout } from "@/components/Layout";
import { Button } from "@/components/Button";
import { TitleText } from "@/components/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { QrScanner } from "./QrScanner";
import { useWallets } from "@privy-io/react-auth";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { loyaltyProgramAbi } from "@/context/abi";
import { readContracts } from "wagmi/actions";
import { wagmiConfig } from "@/context/wagmiConfig";
import { numberToHex } from "viem";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {qrPoints} = useAppSelector(state => state.qrPoints)
  const [mode, setMode]  = useState<"qrscan" | undefined>()
  const [pointsOnCard, setPointsOnCard] = useState<number>()
  const [hasVoucherExpired, setHasVoucherExpired] = useState<boolean>()  
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, isLoading, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 

  const fetchProgramData = useCallback(  
    async () => {
      if (loyaltyCard && loyaltyCard.address && prog.address && embeddedWallet) {
        const loyaltyProgramContract = {
          address: prog.address, 
          abi: loyaltyProgramAbi,
        } as const

        const result = await readContracts(wagmiConfig, {
          contracts: [
            {
              ...loyaltyProgramContract,
              functionName: 'balanceOf',
              args: [loyaltyCard?.address]
            },
            {
              ...loyaltyProgramContract,
              functionName: 's_executed',
              args: [qrPoints.signature]
            }
          ],
        })
        setPointsOnCard(result[0].result as unknown as number)
        setHasVoucherExpired(result[1].result as unknown as boolean)
      }}, 
    [loyaltyCard, prog.address, qrPoints.signature, embeddedWallet])
      
  useEffect(() => {    
    if (prog.address && embeddedWallet) {
      fetchLoyaltyCard(prog.address, numberToHex(123456,{size: 32}), embeddedWallet)
    }
  }, [prog.address, embeddedWallet])

  // updating balance points of card. 
  useEffect(() => {
    if (prog) {
      fetchProgramData() 
    }
  }, [prog, fetchProgramData])
  
  return (
    <Layout> 
      <TitleText 
        title = {prog.name ? prog.name : "Home"} 
        subtitle= {pointsOnCard ?  `${pointsOnCard} points` : `0 points`} 
        size = {2} 
        /> 
      <div className="grow flex flex-col justify-start items-center">
        <div className="w-full sm:w-4/5 lg:w-1/2 h-12 p-2 mt-4">
          <Button onClick={() => {
            if (loyaltyCard) 
              sendUserOp(
                loyaltyCard, 
                'requestPoints', 
                [
                  qrPoints.program, 
                  qrPoints.points, 
                  qrPoints.uniqueNumber, 
                  qrPoints.signature,
                  embeddedWallet?.address ? embeddedWallet.address : '0x' 
                ], 
                numberToHex(123456, {size: 32})
              )
          }}> 
            {hasVoucherExpired ?  `Voucher already claimed` : `Claim ${qrPoints.points} points from voucher`} 
          </Button>
        </div>
        <section 
          className="h-full w-full flex flex-col justify-start items-center mb-16 md:mb-0">
          
          <div 
            className="grow-0 opacity-0 aria-selected:grow aria-selected:opacity-100 transition:all ease-in-out duration-300 delay-300 h-2"
            aria-selected={mode == undefined} 
            >
            <div className="w-full h-full grid grid-cols-1 content-center "> 
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
            </div> 
          </div>

          {/* Top bar, always visible */}
          <section 
            className="flex flex-col w-full justify-between items-center h-12 z-10 border border-b-0 rounded-t-full"
            >
            <div 
              className="flex flex-row justify-between items-center w-full m-1"
              style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
              >
                <button 
                  className="grow h-full mt-2"
                  onClick={() => mode == undefined? setMode("qrscan") : setMode(undefined)} 
                  style = {{color: prog.colourAccent}}
                  > 
                  <TitleText 
                  title="Scan voucher & get points!"
                  size={1}
                  />
                </button>     
            </div>
          </section>

          <div 
            className="flex flex-col grow-0 w-full opacity-0 aria-selected:opacity-100 aria-selected:grow transition:all ease-in-out duration-300 delay-300 h-2 border-x"
            aria-selected={mode != undefined} 
            style={{borderColor: prog.colourAccent}}
          > 
            <QrScanner /> 
          </div> 
        </section>
      </div>
    </Layout>
  )
}