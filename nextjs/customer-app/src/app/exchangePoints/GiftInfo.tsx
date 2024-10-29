import { Button } from "@/components/Button";
import { NoteText, SectionText } from "@/components/StandardisedFonts";
import { loyaltyGiftAbi } from "@/context/abi";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import useWatchEvent from "@/hooks/useWatchEvent";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import { parseRequirementReply } from "@/utils/parsers";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useState } from "react";
import { numberToHex } from "viem";
import { useReadContract, useReadContracts, useWriteContract } from "wagmi";

export const GiftInfo = ({
  address,  
  name,
  points,
  additionalReq, 
  metadata, 
}: Gift) => {
  const giftContract = { address: address, abi: loyaltyGiftAbi } as const
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)
  const [selected, setSelected] = useState<boolean>(false) 
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error: errorCard, pending: pendingCard, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 
  const { watchEvent, eventLog, status: statusExchange } = useWatchEvent() 
  const { data, error, error: errorReadContract, status, refetch } = useReadContracts({
    contracts: [
      {...giftContract, 
        functionName: 'balanceOf',
        args: [vendorProgram.address]
      }, 
      {...giftContract, 
        functionName: 'requirementsExchangeMet',
        args: [vendorProgram.address]
      }
    ]
  })

  const requirements = data?.map(item => {
    return parseRequirementReply(item.error)
  }) 

  console.log({requirements})

  console.log({data, error, status, walletsReady, errorCard, pendingCard})

  return (
    <main 
      className="flex flex-col border-b"
      style = {{color: vendorProgram.colourAccent, borderColor: vendorProgram.colourAccent}} 
    >
      <button 
        className={`w-full h-fit flex flex-row items-center aria-selected:h-fit p-2`} 
        style = {{color: vendorProgram.colourAccent, borderColor: vendorProgram.colourAccent}} 
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
          subtext={`${points} points ${additionalReq ? `+ ${additionalReq}` : ""}`}
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
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 disabled aria-selected:opacity-100 aria-selected:h-32 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        style = {selected ? {} : {pointerEvents: "none"}}
        > 

        <div className="pb-2">
          <SectionText
              text = {`Available gifts: ${ data ? Number(data[0].result): 0}`} 
              size = {0}
            /> 
        </div>

        <div className="pb-4">
          <SectionText
            text = {`Additional requirements: ${
              additionalReq && String(metadata?.attributes[0].value).length > 0 ? 
                metadata?.attributes[0].value 
                :
                "none"}`
              }
            size = {0}
          /> 
        </div>

        <div className="px-2 h-10 my-2"> 
         {
          requirements && requirements[0] == undefined ? 
            <Button onClick={() => {
              if (loyaltyCard && vendorProgram && vendorProgram.address) 
                sendUserOp(
                  vendorProgram.address, 
                  loyaltyCard, 
                  'exchangePointsForGift', 
                  [
                    address, 
                    embeddedWallet?.address ? embeddedWallet.address : '0x' 
                  ], 
                  123456n
                )
                watchEvent('LoyaltyPointsExchangeForGift')
              }} 
              size = {0}
              aria-disabled = {selected}
              statusButton={statusExchange}
              >
              Exchange points for gift
            </Button>
          :
          requirements ?
            <Button onClick={() => {}}  
              size = {0}
              aria-disabled = {true}
              statusButton="idle"
              >
              {requirements[0]} 
            </Button>
          : 
          null
        }
        </div>
      </div>  
  </main>
  );
};
