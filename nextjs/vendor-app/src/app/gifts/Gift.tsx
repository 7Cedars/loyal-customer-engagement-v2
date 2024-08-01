import { Button } from "@/components/ui/Button";
import { NumLine } from "@/components/ui/NumLine";
import { useAppSelector } from "@/redux/hooks";
import { GiftProps } from "@/types";
import Image from "next/image";
import { useState } from "react";

export const GiftInfo = ({
  imageUri, 
  title,
  description, 
  points,
  claim = "",
  redeem = "", 
}: GiftProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selected, setSelected] = useState<boolean>(false) 

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
          src={imageUri} 
          alt="No valid image detected."
        />
        <section className="grow flex flex-col p-1 text-left text-md">
            <a className="font-bold">
              {title}
            </a>
            <a className="">
              {description}
            </a>
            <a className="">
              {points} points
            </a>
            <a className="">
              Additional requirements: {String(claim.length > 0 || String(redeem.length > 0)) ? "yes" : "no"}
            </a>
        </section>
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className="z-1 w-full grid grid-cols-1 ps-3 p-2 md:p-8 p-1 h-0 opacity-0 aria-selected:opacity-100 aria-selected:h-80 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        > 
        {String(claim.length > 0) ?  
          <div>
            Claim requirement: {claim}
          </div>
          : 
          null
        }
        {String(redeem.length > 0) ?  
          <div>
            Redeem requirement: {claim}
          </div>
          : 
          null
        }

        <div> 
          <NumLine onClick={() => {}} />
        </div>

        <div className="h-12 p-1"> 
          <Button>
            Select gift  
          </Button>
        </div>
      </div> 
    </div>
  );
};
