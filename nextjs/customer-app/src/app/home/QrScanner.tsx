"use client"; 

import { QrData } from '@/types';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/redux/hooks';
import { parseQrData } from '@/utils/parsers';
import { NoteText, TitleText } from '@/components/StandardisedFonts';
import { useZxing } from "react-zxing";

export const QrScanner = () => {
  const [data, setData] = useState<QrData>() 
  const [readerMode, setReaderMode] = useState<boolean>()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();

  useEffect(() => {
    if (data && readerMode) setReaderMode(!readerMode)
  }, [data, readerMode])

  const { ref } = useZxing({
    onDecodeResult(result) {
      const parsedResultRaw = parseQrData(result.getText());
      setParsedResult(parsedResultRaw)
    },
  });

  // console.log("result: ", result)
  const onNewScanResult: any = (decodedText: any, decodedResult: any) => {
    console.log("decodedText: ", decodedText)
    console.log("decodedResult: ", decodedResult)
};

  // £bug: it does NOT resize! £todo:  Why? How to solve 
  return (
    <section className="grow flex flex-col items-center justify-center">
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
    </section> 
  );
}
