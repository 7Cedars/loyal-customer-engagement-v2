import { useState } from "react";
import { Button } from "./Button";
import Image from "next/image";

type NumLineProps = {
  size?: 0 | 1 | 2; 
  onClick: (arg0: number) => void;
  isLoading?: boolean;
};

const numbers = [1, 5, 25, 150] // this can be flexible input. 

export const NumLine = ({
  size = 1, 
  onClick,
  isLoading = false
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
      <div className="flex w-24"> 
          { !isLoading ? 

          <Button onClick={ () => handleClick(selectedAmount)}  size = {size} >
              Mint
          </Button>
          : 
          <Button onClick={() => {}} >
              <div className="flex justify-center items-center">
                <Image
                  className="rounded-lg opacity-25 flex-none mx-3 animate-spin"
                  width={30}
                  height={30}
                  src={"/images/loading2.svg"}
                  alt="Loading icon"
                />
              </div>
            </Button>
        }
        </div>
    </div>
  );
};
