import { Button } from "@/components/Button";
import { NoteText, SectionText } from "@/components/StandardisedFonts";
import { loyaltyGiftAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import Image from "next/image";
import { useState } from "react";
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
  const { writeContract, error } = useWriteContract()
  const { data, isError, isLoading, status, refetch } = useReadContract({
    address: address,
    abi: loyaltyGiftAbi,
    functionName: 'balanceOf',
    args: [selectedProgram.address]
  })

  console.log({data, error, isError, isLoading, status})

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
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 disabled aria-selected:opacity-100 aria-selected:h-32 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        style = {selected ? {} : {pointerEvents: "none"}}
        > 

        <div className="pb-2">
          <SectionText
              text = {`Available gifts: ${Number(data)}`} 
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

        <div className="p-2"> 
          <Button onClick={() => {}} 
            size = {0}
            aria-disabled = {selected}
            >
              Request gift
          </Button>
        </div>
        
      </div>  
  </main>
  );
};
