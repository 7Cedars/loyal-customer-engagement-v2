import { Button } from "@/components/ui/Button"
import { NumPad } from "@/components/ui/NumPad"
import { useAppSelector } from "@/redux/hooks"
import { useState } from "react"
import QRCode from "react-qr-code";


export const GivePoints = () => {
  const [mode, setMode] = useState<string>('points')
  const [amountPoints, setAmountPoints] = useState<number>(0)
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

// process.env.NEXT_PUBLIC_BASE_URI
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
        <Button onClick={() => {setMode('QR')}}>
          Create QR
        </Button>
      </div>
    </section>
  )

  const renderedQrCode: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center">
        <QRCode 
          value={"This is a test value"}
          // value={`${process.env.NEXT_PUBLIC_BASE_URI}/customerLanding?prog=${parseEthAddress(selectedLoyaltyProgram?.programAddress)}&proguri=${parseUri(selectedLoyaltyProgram?.metadata?.imageUri)}`}
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