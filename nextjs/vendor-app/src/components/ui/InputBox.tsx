import { useAppSelector } from "@/redux/hooks";
import { ChangeEvent, useState } from "react";

type InputBoxProps = {
  nameId: string; 
  placeholder?: string; 
  disabled?: boolean;
  minLength?: number; 
  maxLength?: number; 
  size?: number; 
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const InputBox = ({
  nameId, 
  placeholder="Enter text here.", 
  disabled = false, 
  minLength = 5, 
  maxLength = 32,
  size = 10, 
  onChange,
}: InputBoxProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  const handleChange = ({event}: {event:ChangeEvent<HTMLInputElement>}) => {
    if(typeof onChange === 'function'){
      onChange(event)
    }   
  }

  return (
    <div className="w-full flex flex-row p-2">
      <input 
        className={`w-full h-full grid grid-cols-1 text-md text-center border place-items-center rounded-lg p-1 h-12`}
        style={{borderColor: selectedProgram.colourAccent, background: selectedProgram.colourBase}}
        disabled={disabled}
        type="text" 
        placeholder={placeholder}
        id={nameId} 
        name={nameId} 
        required 
        minLength={minLength} 
        maxLength={maxLength} 
        size={size} 
        onChange={(event) => handleChange({event: event})}
        />
    </div>
  );
};

