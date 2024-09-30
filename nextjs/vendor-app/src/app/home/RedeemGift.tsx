"use client"; 

// NB! This still has to be further developed - after implementing consumer app. 
import { QrData } from '@/types';
import { useZxing } from "react-zxing";
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { TitleText } from '@/components/ui/StandardisedFonts';
import { parseQrData } from '@/utils/parsers';

export const RedeemGifts = () => {
  const [data, setData] = useState<QrData>() 
  const [readerMode, setReaderMode] = useState<boolean>()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [result, setResult] = useState("");
  
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  useEffect(() => {
    if (result) {
      console.log("Raw result:", result) 
      console.log("parsed result:", parseQrData(result)) 
    } 
  }, [result])

  

  useEffect(() => {
    if (data && readerMode) setReaderMode(!readerMode)
  }, [data, readerMode])


  // £bug: it does NOT resize! £todo:  Why? How to solve? 
  return (
    <section className="grow flex flex-col items-center justify-center">
       <div 
        className="p-2 w-full max-w-96 h-fit grid grid-cols-1 justify-items-center content-center"
        style = {{color: prog.colourAccent, borderColor: prog.colourAccent}}
        >
          <div className='py-2'>
            <TitleText 
            title='Scan Qr Code'
            subtitle='Scan customer Qr code and redeem their gift'
            /> 
          </div>
          <video ref={ref} />
      </div>
    </section> 
  );
}