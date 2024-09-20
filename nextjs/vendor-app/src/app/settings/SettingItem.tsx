import { Button } from "@/components/ui/Button";
import { NumLine } from "@/components/ui/NumLine";
import { NoteText } from "@/components/ui/StandardisedFonts";
import { loyaltyProgramAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { useWriteContract } from "wagmi";

type ButtonProps = {
  selected: boolean; 
  titleText: string; 
  children: any;
  onClick?: () => void;
};

export const SettingItem = ({
  titleText, 
  selected = false, 
  onClick,
  children,
}: ButtonProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <div 
      className="w-full grow grid grid-cols-1 justify-items-start content-start aria-selected:h-fit border border-green-500" 
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.   
      aria-selected = {selected}
      >
      <button 
        className={`z-10 w-full h-fit flex flex-row justify-center p-2 border border-blue-500`} 
        onClick={onClick}
        >
        <NoteText size={1} message={titleText} /> 
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className="z-1 w-full flex flex-row justify-center ps-3 p-2 md:px-8 p-1 h-1 opacity-0 aria-selected:opacity-100 aria-selected:h-80 ease-in-out duration-300 delay-300 border border-green-500"
        aria-selected = {selected}
        > 
        {selected ? 
        <>
          {children}
        </>
        :
        null
        }
      </div> 
    </div>
  );
};
