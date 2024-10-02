"use client"; 

// NB! This still has to be further developed - after implementing consumer app. 
import { Program, QrData } from '@/types';
import { useZxing } from "react-zxing";
import {  useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { NoteText, SectionText, TitleText } from '@/components/ui/StandardisedFonts';
import { parseQrData } from '@/utils/parsers';
import Image from "next/image";
import { Button } from '@/components/ui/Button';
import { useWriteContract } from 'wagmi';
import { useGift } from '@/hooks/useGift';
import { loyaltyProgramAbi } from '@/context/abi';

type RedeemGiftProps = {
  program: Program;
  data: QrData;
};

const RedeemGiftComponent = ({
  program, 
  data
}: RedeemGiftProps)  => {
  const {status, gift, fetchGift, error} = useGift()
  const { data: dataWriteContract, error: errorWriteConrtact, writeContract } = useWriteContract()

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
                    program,
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

export const RedeemGifts = () => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();
  
  const { ref } = useZxing({
    onDecodeResult(result) {
      const parsedResultRaw = parseQrData(result.getText());
      setParsedResult(parsedResultRaw)
    },
  });

  // £bug: it does NOT resize! £todo:  Why? How to solve? 
  return (
    <section className="grow flex flex-col items-center justify-center mt-8 mb-20">
       <div 
        className="p-2 w-full h-full flex flex-col items-center justify-center"
        style = {{color: prog.colourAccent, borderColor: prog.colourAccent}}
        >

        {  parsedResult && parsedResult ? 

          <RedeemGiftComponent 
            program = {prog} 
            data = {parsedResult} />
          : 
          <>
            <div className='py-2'>
              <TitleText 
              title='Scan Qr Code'
              subtitle='Scan customer Qr code and redeem their gift'
              /> 
            </div>
            <video ref={ref} />
          {
            parsedResult === null ?  
            <div className='pt-4'>
              <NoteText 
                message='Qr code does not contain valid data.'
                size={1}
                /> 
            </div>
            : 
            null
            }
          </>
          
        }
      </div>
    </section> 
  );
}