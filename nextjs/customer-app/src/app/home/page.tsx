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
import { useTransaction } from "wagmi";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {qrPoints} = useAppSelector(state => state.qrPoints)
  const [mode, setMode]  = useState<"qrscan" | undefined>()
  const [pointsOnCard, setPointsOnCard] = useState<number>()
  const [hasVoucherExpired, setHasVoucherExpired] = useState<boolean>()  
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, isLoading, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 
  const {data} = useTransaction({blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d', index:0})
  console.log({data})
  // 0x29e81dd870270bb951e437677b471318a3afa266d61233a0569661b26462b2ff
//0xba1182ea90dd1b9082ec76dd573a463e886268eedb401f4a27fc4c401cce25ac

  console.log("use LoyaltyCard:", {
    error, isLoading, loyaltyCard
  })
  console.log({
    embeddedWallet
  })

  const fetchDataFromProgram = useCallback(  
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
    [loyaltyCard, prog.address, qrPoints.signature, embeddedWallet]
  )
      
  useEffect(() => {    
    if (prog.address && embeddedWallet) {
      fetchLoyaltyCard(prog.address, numberToHex(123456,{size: 32}), embeddedWallet)
    }
  }, [, prog.address, embeddedWallet, fetchLoyaltyCard])

  // updating balance points of card. 
  useEffect(() => {
    if (prog) {
      fetchDataFromProgram() 
    }
  }, [prog, fetchDataFromProgram])
  
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
            if (loyaltyCard && prog.address && embeddedWallet) 
              sendUserOp(
                prog.address, 
                loyaltyCard, 
                'requestPoints', 
                [
                  qrPoints.program, 
                  qrPoints.points, 
                  qrPoints.uniqueNumber, 
                  embeddedWallet.address, 
                  qrPoints.signature
                ], 
                123456n
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