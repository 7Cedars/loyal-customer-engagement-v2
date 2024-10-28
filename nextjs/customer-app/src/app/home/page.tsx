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
import { useDispatch } from "react-redux";
import { setCardExists } from "@/redux/reducers/cardReducer";
import { LoyaltyCard } from "@/types";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {voucher} = useAppSelector(state => state.voucher)
  const [mode, setMode]  = useState<"qrscan" | undefined>()
  const [pointsOnCard, setPointsOnCard] = useState<number>()
  const [hasVoucherExpired, setHasVoucherExpired] = useState<boolean>()  
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, loading, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 
  const dispatch = useDispatch();
  const {cardExists} = useAppSelector(state => state.loyaltyCard) 

  console.log("@home page: ", {loading})
  console.log("@home page: ", {error})
  console.log("@home page: ", {loyaltyCard})

  useEffect(() => {
    if (prog.address && embeddedWallet) {
      fetchLoyaltyCard(prog.address, 123456n, embeddedWallet)
    }
  }, [, prog.address, embeddedWallet, fetchLoyaltyCard])

  const fetchDataFromProgram = useCallback(  
    async () => {
      const isDeployed = await loyaltyCard?.isDeployed() 
      dispatch(setCardExists(isDeployed ? true : false))

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
              args: [voucher.signature]
            }
          ],
        })
        setPointsOnCard(result[0].result as unknown as number) // this should dispatch to store. 
        setHasVoucherExpired(result[1].result as unknown as boolean)
      }}, 
    [loyaltyCard, prog.address, voucher.signature, embeddedWallet, dispatch]
  )
    
  // updating balance points of card + if card is deployed. 
  useEffect(() => {
    if (prog) {
      fetchDataFromProgram() 
    }
  }, [prog, fetchDataFromProgram])
  console.log("voucher.points:", voucher.points)
  
  return (
    <Layout> 
      <TitleText 
        title = {prog.name ? prog.name : "Home"} 
        subtitle= {cardExists ?  `${pointsOnCard} points` : `You do not have a loyalty card yet`} 
        size = {2} 
        />  
        <div className="grow flex flex-col justify-start items-center">
      {
        voucher.points != 0 ? 
          <div className="w-full sm:w-4/5 lg:w-1/2 h-16 p-2 mt-4">
            <Button onClick={() => {
              if (loyaltyCard && prog.address && embeddedWallet) 
                
                console.log("embeddedWallet.address:", embeddedWallet?.address)
                sendUserOp(
                  prog.address as `0x${string}`, 
                  loyaltyCard as LoyaltyCard, 
                  'requestPoints', 
                  [
                    voucher.program, 
                    voucher.points, 
                    voucher.uniqueNumber, 
                    embeddedWallet?.address as `0x${string}`,  
                    voucher.signature
                  ], 
                  123456n
                )
            }}
            statusButton={hasVoucherExpired ? "disabled" : "idle"}
            >
              {
              hasVoucherExpired ?  
                `Voucher already claimed` 
              : 
              cardExists ? 
                `Claim ${voucher.points} points from voucher`
              :
                `Request card and claim ${voucher.points} points`
              } 
            </Button>
          </div>
          :
          null  
        }
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
            style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
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
            < QrScanner /> 
          </div> 
        </section>
      </div>
    </Layout>
  )
}