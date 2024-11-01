"use client"; 

import { QrData } from '@/types';
import { useEffect, useState } from 'react';
import { parseQrData } from '@/utils/parsers';
import { NoteText, TitleText } from '@/components/StandardisedFonts';
import { useZxing } from "react-zxing";
import { Button } from '@/components/Button';
import { useMediaDevices } from "react-media-devices";

export const QrScanner = () => {
  const [data, setData] = useState<QrData>() 
  const [readerMode, setReaderMode] = useState<boolean>()
  const [parsedResult, setParsedResult] = useState<QrData | null | undefined>();
  const constraints: MediaStreamConstraints = {video: true, audio: false}
  // see https://www.npmjs.com/package/react-zxing for how to manage qrreader
  const { devices } = useMediaDevices({ constraints }); 
  const [deviceId, setDeviceId] = useState<string | undefined>()

  useEffect(() => {
    if (data && readerMode) setReaderMode(!readerMode)
  }, [data, readerMode])

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
    <section className="grow flex flex-col items-center justify-between m-2">
        <div className='max-w-96 mb-20 flex flex-col h-full w-full items-center justify-between overflow-y-auto overflow-x-hidden'>
            <div className='px-2'>
              <TitleText 
              title='Scan Qr Code'
              subtitle='Scan customer Qr code and redeem their gift'
              /> 
            </div>
            <div className='grow max-h-96 max-w-96 flex flex-col  items-center justify-center '>
              <video ref={ref} />
            </div>
            <div className='h-12 w-full mx-4 my-1 z-20'>
              <Button 
                statusButton={'idle'}
                onClick={()=> deviceId ? setDeviceId(undefined) : handleSelectionCamera()}>
                  {deviceId ? "Close qr scanner" : "Show qr scanner"} 
              </Button>
            </div>
            {/* if multiple camera exist on device, user can toggle through cameras. I might need to save preference this in localStorage later on.  */}
            { devices && devices.length > 1 ?
              <div className='h-12 w-full mx-4 my-1 z-20'>
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
          </div>
    </section> 
  );
}
