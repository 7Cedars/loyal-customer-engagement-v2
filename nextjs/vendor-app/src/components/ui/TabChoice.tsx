// I am using this as an example for now to create modular range slider (and modal). 
// Taken from react-graph-gallery github repo.  

import { useAppSelector } from "@/redux/hooks";
import { useState } from "react";

type TabChoiceProps = {
  optionOne?: string;
  optionTwo?: string;
  initialChoice?: number; 
  onChange?: (choice: string) => void;
};

export const TabChoice = ({
  optionOne = "choiceOne", 
  optionTwo = "choiceTwo",
  initialChoice = 0,  
  onChange,
}: TabChoiceProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const choices: string[] = [optionOne, optionTwo]
  const [choice, setChoice] = useState<string | undefined>(choices[initialChoice])

  const handleChange = ({target}: {target:string}) => {
    setChoice(target)
    
    if(typeof onChange === 'function'){
      onChange( target )
    } 
  }

  return (
    <section className="w-full h-fit grid grid-cols-2 gap-8 p-2"> 
      <button 
        className={`text-sm text-center border-b-2 content-center h-fit pb-2`} 
        style = {{
          color: selectedProgram.colourAccent, 
          borderColor: choice == optionOne ? selectedProgram.colourAccent : selectedProgram.colourBase 
        }} 
        onClick={() => handleChange({target: choices[0]})} 
        >
          {optionOne}
      </button>
      
      <button 
        className={`text-sm text-center border-b-2 content-center h-fit pb-2`} 
        style = {{
          color: selectedProgram.colourAccent, 
          borderColor: choice == optionTwo ? selectedProgram.colourAccent : selectedProgram.colourBase
        }} 
        onClick={() => handleChange({target: choices[1]})} 
      >
        {optionTwo}
      </button>
    </section> 
  )
};
