import { Button } from "@/components/Button";
import { NoteText, SectionText, TitleText } from "@/components/StandardisedFonts";
import { loyaltyGiftAbi } from "@/context/abi";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { numberToHex } from "viem";
import { useChainId, useReadContract, useSignTypedData, useWriteContract } from "wagmi";

export const GiftInfo = ({
  address,  
  giftId, 
  name,
  points,
  additionalReq, 
  metadata
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
  const { data: signature, isPending, isError: isErrorSignTypedData, error, isSuccess, signTypedData, reset } = useSignTypedData()
  const {loyaltyCard, error: errorCard, isLoading: isLoadingCard, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 
  const uniqueNumber = useRef<bigint>(BigInt(Math.random() * 10 ** 18))
  const chainId = useChainId();  

  const domain = {
    name: selectedProgram.name, 
    chainId: chainId,
    verifyingContract: selectedProgram.address
  } as const

  const types = {
    GiftToRedeem: [
      { name: 'program', type: 'address' },
      { name: 'owner', type: 'address' },
      { name: 'gift', type: 'address' },
      { name: 'giftId', type: 'uint256' },
      { name: 'uniqueNumber', type: 'uint256' }
    ],
  } as const

  // £todo: would be better to just build a conditional callback function. 
  const message = {
    program: selectedProgram.address ? selectedProgram.address : '0x0',
    owner: embeddedWallet && embeddedWallet.address ? embeddedWallet.address as `0x${string}` : '0x0', 
    gift: address as `0x${string}`, 
    giftId: giftId ? giftId : 0n, 
    uniqueNumber: uniqueNumber.current,
  } as const

  console.log({data, isError, isLoading, status, walletsReady, errorCard, isLoadingCard})

  const renderedQrCode: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center">
      <div className="py-4">
        <SectionText
          text = "Show this Qr code to your vendor"
          size={1} 
        />
      </div>
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
    </section>
  )
  
  const noRenderedQrCode: React.JSX.Element = (
    <section className="grow flex flex-col items-center justify-center">
      <TitleText 
        title = "No QR code available."
        subtitle="Request to redeem gift to create Qr code to show to vendor."
        size={1} 
      />
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
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 disabled aria-selected:opacity-100 aria-selected:h-[40rem] ease-in-out duration-300 delay-300"
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

        { signature ? renderedQrCode : noRenderedQrCode } 
        <div className="px-2 h-10 my-4"> 
          { signature? 
            <Button onClick={() => reset()}> 
              Back
            </Button>
            :
            <Button
              size = {0}
              aria-disabled = {selected}
              onClick={() => signTypedData({
                domain, 
                types, 
                primaryType: 'GiftToRedeem',
                message
              })} >
              Create Qr Code to Redeem gift 
            </Button>
          }
        </div>
      </div>  
  </main>
  );
};
