"use client"; 

import { Program, QrData } from '@/types';
import {  useEffect, useState } from 'react';
import { NoteText, SectionText, TitleText } from '@/components/ui/StandardisedFonts';
import Image from "next/image";
import { Button } from '@/components/ui/Button';
import { useWriteContract } from 'wagmi';
import { useGift } from '@/hooks/useGift';
import { loyaltyProgramAbi } from '@/context/abi';

type GiftVoucherFoundProps = {
  program: Program;
  data: QrData;
};

export const GiftVoucherFound = ({
  program, 
  data
}: GiftVoucherFoundProps)  => {
  const {status, gift, fetchGift, error} = useGift()
  const { data: dataWriteContract, error: errorWriteConrtact, writeContract } = useWriteContract()

  console.log({errorWriteConrtact, data})

  useEffect(() => {
    if (data && status == "idle") fetchGift(data.gift)
  }, [data, fetchGift, status])

  return (
    <section className="grow flex flex-col h-full items-center justify-between">

          <TitleText 
                title='Gift Voucher Found'
                subtitle='Redeem voucher to check eligibility.'
          /> 
        { gift && data ? 
        <>
          <div 
              className={`w-full h-fit flex flex-row items-center aria-selected:h-fit p-2`} 
              style = {{color: program.colourAccent, borderColor: program.colourAccent}} 
              >
            <Image
              className="w-fit h-fit rounded-lg p-2"
              width={90}
              height={90}
              style = {{ objectFit: "fill" }} 
              src={gift.metadata?.imageUri ? gift.metadata.imageUri : ""} 
              alt="No valid image detected."
            />
            <div className="flex flex-col">
              <SectionText
              text={gift.name}
              subtext={`${gift.points} points ${gift.additionalReq ? `+ ${gift.additionalReq}` : ""}`}
              size = {1} 
              /> 
              <NoteText 
              message = {gift.metadata ? gift.metadata.description : "No description available"} 
              size = {1}
              />  
            </div>
          </div>

            <div className='h-12 w-full flex'>  
              <Button 
              statusButton='idle'
              onClick={() => writeContract({ 
                  abi: loyaltyProgramAbi,
                  address: program.address,
                  functionName: 'redeemGift',
                  args: [
                    program.address,
                    data.owner, 
                    data.gift,
                    data.giftId, 
                    data.uniqueNumber,
                    data.signature
                  ]
                })
              }
              size = {0}
              >
                Redeem gift
              </Button>
            </div>
        </>
        : 
        null
      }
    </section>
  )
}

