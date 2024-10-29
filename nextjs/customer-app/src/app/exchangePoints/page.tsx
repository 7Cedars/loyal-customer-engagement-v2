"use client"; 

import { Layout } from "@/components/Layout"
import { NoteText, TitleText } from "@/components/StandardisedFonts"
import { GiftInfo } from "./GiftInfo";
import { useCallback, useEffect, useState } from "react";
import { useGifts } from "@/hooks/useGifts";
import { useAppSelector } from "@/redux/hooks";
import { loyaltyProgramAbi } from "@/context/abi";
import { useWallets } from "@privy-io/react-auth";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { readContracts } from "wagmi/actions";
import { wagmiConfig } from "@/context/wagmiConfig";

export default function Page() {
  const [pointsOnCard, setPointsOnCard] = useState<number>()
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {status, gifts, fetchGifts} = useGifts()
  const {loyaltyCard, error, pending, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 

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
          ],
        })
        setPointsOnCard(result[0].result as unknown as number)
      }}, 
    [loyaltyCard, prog.address, embeddedWallet]
  )

  useEffect(() => {
    if (prog) {
      fetchGifts() 
      fetchDataFromProgram() 
    }
  }, [prog, fetchGifts, fetchDataFromProgram])

  return (
    <Layout>  
      <TitleText 
        title = "Exchange Points" size = {2} 
        subtitle={pointsOnCard ?  `${pointsOnCard} points` : `0 points`}
        /> 

      <section className="flex flex-col justify-start p-2 overflow-auto h-full">

        {gifts && gifts.length > 0 ?
          gifts?.map(gift => 
            <GiftInfo 
              key = {gift.address} 
              address = {gift.address} 
              name = {gift.name} 
              points = {gift.points}
              additionalReq ={gift.additionalReq} 
              metadata = {gift.metadata}
            />
            )
          :
          <div className="mt-8">
            <NoteText
              message="Gifts you can claim in exchange for points will appear here. Your vendor does not seem to have added any."
              size={1}
              align={1}
            />
          </div>
        }
      </section>
    </Layout>
  )
}