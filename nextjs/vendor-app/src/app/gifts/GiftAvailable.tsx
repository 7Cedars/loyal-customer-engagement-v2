import { Button } from "@/components/ui/Button";
import { InputButton } from "@/components/ui/InputButton";
import { NumLine } from "@/components/ui/NumLine";
import { NoteText, SectionText, TitleText } from "@/components/ui/StandardisedFonts";
import { loyaltyGiftAbi, loyaltyProgramAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift, Status } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const GiftAvailable = ({
  address,  
  name,
  points,
  additionalReq, 
  metadata, 
  allowed
}: Gift) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selected, setSelected] = useState<boolean>(false) 
  const { writeContract, error, data: transactionHash, reset } = useWriteContract()
  const { data: receipt, isError: isErrorReceipt, isSuccess: isSuccessReceipt, error: errorReceipt, status: statusReceipt } = useWaitForTransactionReceipt(
    {  confirmations: 1, hash: transactionHash }
  )
  const { data, isError, error: errorReadContract, status, refetch } = useReadContract({
    address: address,
    abi: loyaltyGiftAbi,
    functionName: 'balanceOf',
    args: [selectedProgram.address]
  })

  console.log({allowed})

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
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 aria-selected:opacity-100 aria-selected:h-64 sm:aria-selected:h-56 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        style = {selected ? {} : {pointerEvents: "none"}}
        > 
        {/* {selected ?  */}
        <>
        <section className="pb-2">
        <NoteText
            message = {`Address gift: ${address}`} 
            size = {1}
          /> 
        </section>
        <section className="pb-2">
        <NoteText
            message = {`Available gifts: ${Number(data)}`} 
            size = {1}
          /> 
        </section>
        <section className="pb-4 h-24">
          <NoteText
            message = "Additional requirements" 
            size = {1}
          /> 
          <NoteText 
            message = {
              `Claim: ${
              additionalReq && String(metadata?.attributes[0].value).length > 0 ? 
              metadata?.attributes[0].value 
              :
              "none"}`
            }
            size = {0}
          />
          <NoteText 
            message = {
              `Redeem: ${
              additionalReq && String(metadata?.attributes[1].value).length > 0 ? 
              metadata?.attributes[1].value 
              :
              "none"}`
            }
            size={0}
          />
        </section>

        <div className="px-2 h-10"> 
          {
            allowed ? 
              <Button 
                statusButton={transactionHash == undefined ? 'idle' : statusReceipt}
                onClick={() => writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'setAllowedGift',
                args: [
                  address,
                  false,
                  false
                ]
                })
              }
              size = {0}
              aria-disabled = {selected}
              >
                Deselect gift
              </Button>
            :
              <Button 
                statusButton={transactionHash == undefined ? 'idle' : statusReceipt}
                onClick={() => writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'setAllowedGift',
                args: [
                  address,
                  true,
                  true
                ]
                })
              }
              size = {0}
              aria-disabled = {selected}
              >
                Select gift
              </Button>

          }
          
        </div>
      </>
    </div>
  </main>
  );
};
