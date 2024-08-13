import { Button } from "@/components/Button";
import { loyaltyProgramAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { useWriteContract } from "wagmi";

export const GiftInfo = ({
  address,  
  name,
  symbol, 
  points,
  additionalReq, 
  metadata, 
}: Gift) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selected, setSelected] = useState<boolean>(false) 
  const { writeContract, error } = useWriteContract()
  console.log("error: ", error)


  return (
    <div 
      className="w-full grow grid grid-cols-1 aria-selected:h-fit" 
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.   
      aria-selected = {selected}
      >
      <button 
        className={`z-10 w-full h-fit flex flex-row items-center justify-start p-2`} 
        onClick={() => setSelected(!selected)}
        >
        <Image
          className="w-fit h-fit rounded-lg p-2"
          width={90}
          height={90}
          style = {{ objectFit: "fill" }} 
          src={metadata?.imageUri ? metadata.imageUri : ""} 
          alt="No valid image detected."
        />
        <section className="grow flex flex-col p-1 text-left text-md">
            <a className="font-bold">
              {name}
            </a>
            <a className="">
              {metadata?.description}
            </a>
            <a className="">
              {points} points
            </a>
            <a className="">
              Additional requirements: {additionalReq ? "yes" : "no"}
            </a>
        </section>
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className="z-1 w-full grid grid-cols-1 ps-3 p-2 md:px-8 p-1 h-1 opacity-0 aria-selected:opacity-100 aria-selected:h-80 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        > 
        {selected ? 
        <>
          {additionalReq && String(metadata?.attributes[0].value).length > 0 ?  
            <div>
              Claim requirement: {metadata?.attributes[0].value}
            </div>
            : 
            null
          }
          {additionalReq && String(metadata?.attributes[1].value).length > 0 ?  
            <div>
              Redeem requirement: {metadata?.attributes[1].value}
            </div>
            : 
            null
          } 

          <div className="h-12 p-1"> 
            <Button onClick={() =>  writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address ? selectedProgram.address : "0x0",
                functionName: 'setLoyaltyGift',
                args: [
                  address,
                  true,
                  true
                ]
              })
            }>
              Select gift  
            </Button>
          </div>
        </>
        :
        null
        }
      </div> 
    </div>
  );
};
