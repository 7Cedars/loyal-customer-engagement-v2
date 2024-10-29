"use client"; 

import { QrData } from '@/types';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/redux/hooks';
import { parseQrData } from '@/utils/parsers';
import { NoteText, TitleText } from '@/components/StandardisedFonts';
import { useZxing } from "react-zxing";
import { Button } from '@/components/Button';

export const QrScanner = () => {
  const [data, setData] = useState<QrData>() 
  const [readerMode, setReaderMode] = useState<boolean>()
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();
  const [qrScanOn, setQrScanOn] = useState<boolean>(false); 

  useEffect(() => {
    if (data && readerMode) setReaderMode(!readerMode)
  }, [data, readerMode])

  const { ref } = useZxing({
    constraints: {video: qrScanOn, audio: false}, 
    onDecodeResult(result) {
      const parsedResultRaw = parseQrData(result.getText());
      setParsedResult(parsedResultRaw)
    },
  });

  return (
    <section className="grow flex flex-col items-center justify-between">
        <>
            <div className='py-2'>
              <TitleText 
              title='Scan Qr Code'
              subtitle='Scan customer Qr code and redeem their gift'
              /> 
            </div>
            <video ref={ref} />
            <div className='h-12 w-full max-w-96 m-2 mb-20'>
              <Button 
                statusButton={'idle'}
                onClick={()=> setQrScanOn(!qrScanOn)}>
                  {qrScanOn ? "Close qr scanner" : "Show qr scanner"} 
              </Button>
            </div>
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
