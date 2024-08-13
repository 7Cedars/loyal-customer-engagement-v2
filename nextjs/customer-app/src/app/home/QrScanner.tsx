"use client"; 

// NB! This still has to be further developed - after implementing consumer app. 
import { QrData } from '@/types';
import { useEffect, useState } from 'react';
import QrCodeReader from '@/components/QrCodeReader';
import { useAppSelector } from '@/redux/hooks';

export const QrScanner = () => {
  const [data, setData] = useState<QrData>() 
  const [readerMode, setReaderMode] = useState<boolean>()
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  useEffect(() => {
    if (data && readerMode) setReaderMode(!readerMode)
  }, [data, readerMode])

  // console.log("result: ", result)
  const onNewScanResult: any = (decodedText: any, decodedResult: any) => {
    console.log("decodedText: ", decodedText)
    console.log("decodedResult: ", decodedResult)
};

  // £bug: it does NOT resize! £todo:  Why? How to solve 
  return (
    <section className="grow flex flex-col items-center justify-center">
       <div 
        className="p-1 w-96 h-96 border border-red-500 grid grid-cols-1 justify-items-center content-center"
        style = {{color: prog.colourAccent, borderColor: prog.colourAccent}}
        >
        <QrCodeReader
                fps={5}
                qrbox= {4000} 
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
            />
       </div>
    </section> 
  );
}