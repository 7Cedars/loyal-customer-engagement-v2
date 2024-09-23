import { useAppSelector } from "@/redux/hooks";
import { Event } from "@/types";
import { HomeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";



type TransactionEvent = Omit<Event, 'address' | 'blockNumber' | 'logIndex'>

export const TransactionInfo = (transaction: TransactionEvent) => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const layoutItem = "w-full h-fit flex flex-row border-2 p-2 border-purple-500"
  const layoutIconBox: string = 'col-span-1 grid text-xs justify-items-center'
  const layoutIcons: string = 'h-24 w-24'

  switch (transaction.event.event) {
    case 'LoyaltyProgramDeployed': {
      return (
        <section className= {layoutItem}>
          <HomeIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="grid grid-cols-1">



          </div>

        THERE IS SOME TEXT HERE 
        </section>
      )
    }

    default: {
      console.log("Type of event not supported:", transaction.event.event);
    }
  }


  // return (
  //   <div 
  //     className={`w-full h-fit flex flex-row items-center p-2`} 
  //     style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.   
  //     >
  //     <Image
  //       className="w-fit h-fit rounded-lg p-2"
  //       width={90}
  //       height={90}
  //       style = {{ objectFit: "fill" }} 
  //       src={imageUri} 
  //       alt="No valid image detected."
  //     />
  //     <section className="grow flex flex-col p-1">
  //         <a className="text-md font-bold">
  //           {title}
  //         </a>
  //         <a className="text-md">
  //           {points} points
  //         </a>
  //         <a className="text-md">
  //           Claim: {claim}
  //         </a>
  //         <a className="text-md">
  //           Redeem: {redeem}
  //         </a>
        
  //     </section>
  //   </div>
  // );
};
