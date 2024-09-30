import { Button } from "@/components/Button";
import { NoteText, SectionText } from "@/components/StandardisedFonts";
import { loyaltyGiftAbi } from "@/context/abi";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { numberToHex } from "viem";
import { useReadContract, useWriteContract } from "wagmi";

export const GiftInfo = ({
  address,  
  name,
  points,
  additionalReq, 
  metadata, 
}: Gift) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selected, setSelected] = useState<boolean>(false) 
  const [renderQrCode, setRenderQrCode] = useState<boolean>(false) 
  const { data, isError, isLoading, status, refetch } = useReadContract({
    address: address,
    abi: loyaltyGiftAbi,
    functionName: 'balanceOf',
    args: [selectedProgram.address]
  })
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error: errorCard, isLoading: isLoadingCard, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 
  const uniqueNumber = useRef<bigint>(BigInt(Math.random() * 10 ** 18))

  console.log({data, isError, isLoading, status, walletsReady, errorCard, isLoadingCard})

  const renderedQrCode: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center">
        <div className="p-1">
          <QRCode 
            value={`prg=${selectedProgram.address}&pts=${points}&un=${uniqueNumber.current}&oc=${embeddedWallet ? embeddedWallet.address : '0x0'}&sig=${signature}`}
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
          <Button onClick={() => setRenderQrCode(true)}> 
            Back
          </Button>
        </div> 
    </section>
  )
    
  return (
    <main 
      className="flex flex-col border-b"
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} 
    >
      <button 
        className={`w-full h-fit flex flex-row items-center aria-selected:h-fit p-2`} 
        style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} 
        onClick={() => setSelected(!selected)}
        aria-disabled = {selected}
        >
        <Image
          className="w-fit h-fit rounded-lg p-2"
          width={90}
          height={90}
          style = {{ objectFit: "fill" }} 
          src={metadata?.imageUri ? metadata.imageUri : ""} 
          alt="No valid image detected."
        />
        <div className="flex flex-col">
          <SectionText
          text={name}
          // subtext={`${points} points ${additionalReq ? `+ ${additionalReq}` : ""}`}
          size = {1} 
          /> 
          <NoteText 
          message = {metadata ? metadata.description : "No description available"} 
          size = {1}
          />  
        </div>
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 disabled aria-selected:opacity-100 aria-selected:h-24 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        style = {selected ? {} : {pointerEvents: "none"}}
        > 

        <div className="pb-4 h-12">
          <SectionText
            text = {`Additional requirements: ${
              additionalReq && String(metadata?.attributes[0].value).length > 0 ? 
                metadata?.attributes[1].value 
                :
                "none"}`
              }
            size = {0}
          /> 
        </div>

        <div className="px-2 h-10 my-2"> 
          {/* This should trigger signing transaction & creation of qr code 
          The function to use to retrieve tokenIds (or rather giftIds) LoyaltyGift is 'tokenOfOwnerByIndex' 
          */}
          <Button onClick={() => {}}
            size = {0}
            aria-disabled = {selected}
            >
            Redeem gift
          </Button>
        </div>
        
      </div>  
  </main>
  );
};
