"use client"; 

// NB! This still has to be further developed - after implementing consumer app. 
import { QrData } from '@/types';
import { useZxing } from "react-zxing";
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { NoteText, SectionText, TitleText } from '@/components/ui/StandardisedFonts';
import { parseQrData } from '@/utils/parsers';
import { GiftVoucherFound } from '@/app/home/GiftVoucherFound';
import { Button } from '@/components/ui/Button';

export const RedeemGifts = () => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();
  const [qrScanOn, setQrScanOn] = useState<boolean>(false); 

  console.log({qrScanOn})
  
  const { ref } = useZxing({
    constraints: {video: qrScanOn, audio: false}, 
    onDecodeResult(result) {
      const parsedResultRaw = parseQrData(result.getText());
      setParsedResult(parsedResultRaw)
    },
  });

  return (
    <section className="grow flex flex-col items-center justify-center mt-8 mb-20">
       <div 
        className="p-2 w-full h-full flex flex-col items-center justify-between"
        style = {{color: prog.colourAccent, borderColor: prog.colourAccent}}
        >

        {  parsedResult && parsedResult ? 

          <GiftVoucherFound 
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
            <div className='h-12 w-full m-2'>
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
          
        }
      </div>
    </section> 
  );
}