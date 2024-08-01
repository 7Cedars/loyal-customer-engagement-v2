import { useState } from "react";
import { Button } from "./Button";
import Image from "next/image";

type NumLineProps = {
  onClick: (arg0: number) => void;
  isLoading?: boolean;
};

const numbers = [1, 5, 25, 150] // this can be flexible input. 

export const NumLine = ({
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
    <div className="grid grid-cols-1 sm:grid-cols-2 w-full"  > 
      <div className="flex grow"> 
      {
        numbers.map(number => 
          <div key = {number} className="flex grow p-1"> 
            <Button onClick={() => setSelectedAmount(number)} >
                  {number} 
            </Button>
          </div>
        )
      }
      </div> 
      <div className="flex grow p-1"> 
          { !isLoading ? 

          <Button onClick={ () => handleClick(selectedAmount)} >
              Mint {selectedAmount} Loyalty Gifts
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
