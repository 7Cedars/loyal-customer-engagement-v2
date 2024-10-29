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
  maxLength = 2000,
  size = 20, 
  onChange,
}: InputBoxProps) => {
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  const handleChange = ({event}: {event:ChangeEvent<HTMLInputElement>}) => {
    if(typeof onChange === 'function'){
      onChange(event)
    }   
  }

  return (
    <div className="w-full flex flex-row p-2">
      <input 
        className={`w-full h-full grid grid-cols-1 aria-selected:border-2 text-md text-center border place-items-center rounded-lg p-2`}
        style={{
          color: vendorProgram.colourAccent, 
          fontPalette: vendorProgram.colourAccent, 
          borderColor: vendorProgram.colourAccent, 
          background: vendorProgram.colourBase, 
          }}
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

