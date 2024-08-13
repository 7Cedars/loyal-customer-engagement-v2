import { Button } from "@/components/ui/Button"
import { NumPad } from "@/components/ui/NumPad"
import { useAppSelector } from "@/redux/hooks"
import { useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code";
import { useSignTypedData } from "wagmi";

export const GivePoints = () => {
  const [mode, setMode] = useState<'points' | 'qr'>('points')
  const [amountPoints, setAmountPoints] = useState<number>(0)
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const { data: signature, isPending, isError, isSuccess, signTypedData, reset } = useSignTypedData()
  const uniqueNumber  = useRef<bigint>(BigInt(Math.random() * 10 ** 18))

  console.log("signature: ", signature)

  // named list of all type definitions
  const types = {
    RequestPoints: [
      { name: 'program', type: 'address' },
      { name: 'points', type: 'uint256' },
      { name: 'uniqueNumber', type: 'uint256' }
    ],
  } as const

  const handleSigning = () => {
    uniqueNumber.current = BigInt(Math.random() * 10 ** 18) 

    if (prog.address) {
      const message = {
        program: prog.address,
        points:  BigInt(amountPoints),
        uniqueNumber: uniqueNumber.current,
      } as const
    
      signTypedData({
        types, 
        primaryType: 'RequestPoints',
        message
      })} 
    }

  useEffect(() => {
    if (isSuccess) setMode('qr')
  }, [isSuccess])

  const selectPoints: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center"> 
      <a 
        className="text-2xl p-2"
        style={{color:prog.colourAccent}}
        >
        {String(amountPoints)} Points
      </a>
      <div className="">
        <NumPad onChange={(amount) =>{setAmountPoints(amount)}}/>
      </div>
      <div className="w-full h-12 p-1">
        <Button onClick={() => handleSigning()} >
          Create QR
        </Button>
      </div>
    </section>
  )

  const renderedQrCode: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center">
        <div className="p-1">
          <QRCode 
            value={`${process.env.NEXT_PUBLIC_C_URI}?prg=${prog.address}&pts=${amountPoints}&un=${uniqueNumber.current}&sig=${signature}`}
            style={{ 
              height: "350px", 
              width: "350px", 
              objectFit: "cover", 
              background: 'white', 
              padding: '16px', 
            }}
            bgColor="#ffffff" // "#0f172a" 1e293b
            fgColor="#000000" // "#e2e8f0"
            level='M'
            className="rounded-lg"
          />
        </div>

        <div className="h-12 w-full p-1">
          <Button onClick={() => setMode('points')}> 
            Back
          </Button>
        </div> 
    </section>
  )

  return (
    <section className="flex flex-col items-center"> 
    { 
    mode == 'points' ? 
      selectPoints
      :
      renderedQrCode
    }
    </section> 
  );
}