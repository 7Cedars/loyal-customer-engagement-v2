import { useState } from "react";
import { Button } from "./Button";
import { BackspaceIcon } from "@heroicons/react/24/outline";

type NumPadProps = {
  onChange: (arg0: number) => void;
};

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'] 

export const NumPad = ({
  onChange,
}: NumPadProps) => {

  const [fullNumberString, setFullNumberString] = useState<string>('0')  

  const handleChange= ({target}: {target: string}) => {

    if (target === '' || undefined) {target = '0'}
    setFullNumberString(target)
    
    if(typeof onChange === 'function'){
      onChange( parseInt(target))
    }    
  }

  return (
    <div className="grid grid-cols-3 w-72"> 
    {
      numbers.map(number => 
        <div 
          key = {number} 
          className="flex w-24 h-16 p-1"
          >
          <Button onClick={() => handleChange({target: fullNumberString.concat(number)})} statusButton="idle" >
                {number} 
          </Button>
        </div>
      )
    }
      <div 
        className="flex w-24 h-16 p-1"
        > 
        <Button onClick={ () => handleChange({target: fullNumberString.slice(0, -1)})} statusButton="idle">
           <div className="w-full h-full flex justify-center">
            <BackspaceIcon
              className='h-7 w-7'
              aria-hidden="true"
            />
          </div>
        </Button>
      </div>
    </div>
  );
};
