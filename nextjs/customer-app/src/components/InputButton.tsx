import { ChangeEvent, useState } from "react";
import { Button } from "./Button";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";

type NumLineProps = {
  nameId: string; 
  size?: 0 | 1 | 2; 
  onClick: (arg0: string) => void;
  pending?: boolean;
  disabled?: boolean; 
  placeholder?: string; 
  buttonText?: string; 
};

const fontSize = [
  "text-sm p-1 h-6",
  "text-md p-2 h-12", 
  "text-lg p-3 h-16", 
]

export const InputButton = ({
  nameId, 
  size = 1, 
  onClick,
  pending = false, 
  disabled = false, 
  placeholder = "Write something here.",
  buttonText = "Action"
}: NumLineProps) => {

  const [ input, setInput ] = useState<string>("") 
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  const handleClick= (input: string) => {
    if(typeof onClick === 'function'){
      onClick(input)
   }    
  }

  return (
    <div className="w-full flex flex-row"> 
      <div className="flex grow"> 
      <input 
        className={`w-full h-full grid grid-cols-1 disabled:opacity-50 text-center border content-center rounded-lg ${fontSize[size]}`}
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
        size={size} 
        onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
        />
      </div> 

      <div className="flex min-w-36 w-fit ps-2"> 
          { !pending ? 

          <Button onClick={ () => handleClick(input)} size = {size} statusButton="idle">
              {buttonText}
          </Button>
          : 
          <Button onClick={() => {}} size = {size} statusButton="idle">
              <div className="flex justify-center items-center">
                <Image
                  className="rounded-lg opacity-25 flex-none mx-3 animate-spin"
                  width={30}
                  height={30}
                  src={"/images/pending2.svg"}
                  alt="Loading icon"
                />
              </div>
            </Button>
        }
        </div>
    </div>
  );
};
