"use client"; 

import { Layout } from "@/components/Layout"
import { NoteText, SectionText, TitleText } from "@/components/StandardisedFonts"
import { GiftInfo } from "./GiftInfo";
import { useCallback, useEffect, useState } from "react";
import { useGifts } from "@/hooks/useGifts";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import { readContract } from "viem/actions";
import { wagmiConfig } from "@/context/wagmiConfig";
import { loyaltyGiftAbi } from "@/context/abi";
import { useWallets } from "@privy-io/react-auth";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { readContracts } from "wagmi/actions";
import { numberToHex } from "viem";
import { parseNumber } from "@/utils/parsers";

export default function Page() {
  const {status, gifts, fetchGifts} = useGifts()
  const [allGifts, setAllGifts] = useState<Gift[]>() 
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, pending, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 

  console.log({allGifts})

  const fetchGiftsAmount = useCallback(
    async (gifts: Gift[]) => {
      let gift: Gift
      let giftBalances: number[] = []

      if (loyaltyCard) {
        try {
          for await (gift of gifts) {
            const result = await readContracts(wagmiConfig, {
                contracts: [{
                abi: loyaltyGiftAbi,
                address: gift.address,
                functionName: 'balanceOf', 
                args: [loyaltyCard.address]
              }]
            })
            result.forEach(item => {giftBalances.push(Number(item.result))})
          }
          console.log({giftBalances})
          const allGiftsRaw = allGiftsBuilder(giftBalances, gifts) 
          setAllGifts(allGiftsRaw)
        }
        catch (error) {
          console.log({error})
        }
      }
    }, [loyaltyCard]
  )

  const allGiftsBuilder = (giftBalances: number[], gifts: Gift[]) => {
    if (giftBalances.length != gifts.length) {
      Error("Arrays need to be of same length")
    } 
    const allGifts: Gift[] = [] 
    gifts.forEach((gift, i) => {
      const temp = new Array(giftBalances[i])
      temp.fill(gift)
      allGifts.push(...temp) // 
    })
    return allGifts
  }

  useEffect(() => {
    if (prog && prog.address && embeddedWallet) {
      fetchGifts() 
      fetchLoyaltyCard(prog.address, 123456n, embeddedWallet)
    }
  }, [prog, fetchGifts, fetchLoyaltyCard, embeddedWallet])

  useEffect(() => {
    if (gifts) {
      fetchGiftsAmount(gifts)
    }
  }, [gifts, fetchGiftsAmount])

  return (
    <Layout>  
      <TitleText title = "Redeem Gifts" size = {2} /> 
      
      <section className="flex flex-col justify-start p-2 overflow-auto h-full">
        {
        allGifts && allGifts.length > 0 ? 

          allGifts.map((gift, i) => 
            <GiftInfo 
              key = {i} 
              address = {gift.address} 
              name = {gift.name} 
              symbol = {gift.symbol}
              uri = {gift.uri} 
              points = {gift.points}
              additionalReq ={gift.additionalReq} 
              metadata = {gift.metadata}
            />
            )
          :
          <div className="mt-8">
            <NoteText
              message="Gift vouchers will appear here. You do not seem to have any yet."
              size={1}
              align={1}
            />
          </div>
        }
      </section>
    </Layout>
  )
}