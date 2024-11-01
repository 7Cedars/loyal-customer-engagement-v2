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
import { useMediaDevices } from "react-media-devices";

export const RedeemGifts = () => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();
  const constraints: MediaStreamConstraints = {video: true, audio: false}
  // see https://www.npmjs.com/package/react-zxing for how to manage qrreader
  const { devices } = useMediaDevices({ constraints }); 
  const [deviceId, setDeviceId] = useState<string | undefined>()
  
  console.log({devices, deviceId})

  const handleSelectionCamera = () => {
    console.log("handleSelectionCamera triggered")
    if (devices && devices.length > 1) {
      const devicesIds: string[] = []
      devices.forEach((device: MediaDeviceInfo) => {
        if (device.deviceId.length > 0) devicesIds.push(device.deviceId)   
      })
      console.log({devicesIds})
      
      const index = deviceId ? devicesIds.indexOf(deviceId) : -1 
      console.log({index})

      if (devicesIds.length == 0) { 
        setDeviceId(undefined)
      } 
      else if (devicesIds.length > 0 && index == devicesIds.length - 1) {
        setDeviceId(devicesIds[0])
      }
      else {
        setDeviceId(devicesIds[index + 1])
      }
    } 
  }
  
  const { ref } = useZxing({
    paused: !deviceId,
    deviceId,
    onDecodeResult(result) {
      const parsedResultRaw = parseQrData(result.getText());
      setParsedResult(parsedResultRaw)
    },
  });

  return (
    <section className="h-full flex flex-col items-center justify-center mt-20 mb-20">
       <div 
        className="px-2 w-full h-full flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden"
        style = {{color: prog.colourAccent, borderColor: prog.colourAccent}}
        >

        {  parsedResult && parsedResult ? 

          <GiftVoucherFound 
            program = {prog} 
            data = {parsedResult} />
          : 
          <>
            <div className=''>
              <TitleText 
              title='Scan Qr Code'
              subtitle='Scan customer Qr code and redeem their gift'
              /> 
            </div>
            <div className='grow max-h-96 max-w-96'>
              <video ref={ref} />
            </div>
            <div className='h-12 w-full mx-4 my-1'>
              <Button 
                statusButton={'idle'}
                onClick={()=> deviceId ? setDeviceId(undefined) : handleSelectionCamera()}>
                  {deviceId ? "Close qr scanner" : "Show qr scanner"} 
              </Button>
            </div>
            {/* if multiple camera exist on device, user can toggle through cameras. I might need to save preference this in localStorage later on.  */}
            { devices && devices.length > 1 ?
              <div className='h-12 w-full mx-4 my-1'>
                <Button 
                  statusButton={'idle'}
                  onClick={()=> handleSelectionCamera()}>
                    Different camera 
                </Button>
              </div>
            :
            null
            }

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