import { useState } from "react";
import { Button } from "./Button";
import Image from "next/image";
import { Status } from "@/types";

type NumLineProps = {
  size?: 0 | 1 | 2; 
  onClick: (arg0: number) => void;
  statusButton?: Status;
};

const numbers = [1, 5, 25, 150] // this can be flexible input. 

export const NumLine = ({
  size = 1, 
  onClick,
  statusButton = 'idle'
}: NumLineProps) => {

  const [ selectedAmount, setSelectedAmount ] = useState<number>(25) 

  const handleClick= (selectedAmount: number) => {
    if(typeof onClick === 'function'){
      onClick(selectedAmount)
   }    
  }

  return (
    <div className="w-full h-full flex flex-row"  > 
      <div className="flex grow"> 
      {
        numbers.map(number => 
          <div key = {number} className="flex grow pe-2"> 
            <Button 
              statusButton='idle'
              onClick={() => setSelectedAmount(number)}
              selected = {selectedAmount == number}
              size = {size}
              >
                {number} 
            </Button>
          </div>
        )
      }
      </div> 
      <div className="flex w-32"> 
          <Button 
            statusButton={statusButton}
            onClick={ () => handleClick(selectedAmount)}  size = {size} 
            >
              Mint
          </Button>
        </div>
    </div>
  );
};
