import { NoteText, SectionText } from "@/components/ui/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";
import { Event } from "@/types";
import { toEurTimeFormat, toFullDateFormat } from "@/utils/transformData";
import { 
  HomeIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  GifIcon,
  SquaresPlusIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon

} from "@heroicons/react/24/outline";


type TransactionEvent = Omit<Event, 'address' | 'blockNumber' | 'logIndex'>

export const TransactionInfo = (transaction: TransactionEvent) => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const layoutItem = "w-full h-fit flex flex-row items-center border-b p-2"
  const layoutIcons: string = 'me-6 h-16 w-16'

  switch (transaction.event.event) {
    case 'Log': {
      return (
        <section 
          className= {layoutItem}
          style = {{borderColor: prog.colourAccent}}
          >
          <CreditCardIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start ">
            <SectionText
              text = {"Funds received"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }   
              size={0}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`From: ${transaction.event.args.sender}`} size = {0} />
              <NoteText message = {`Amount: ${transaction.event.args.value}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'LoyaltyProgramDeployed': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <BuildingOffice2Icon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Loyalty program deployed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }
              size={0}  
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Owner: ${transaction.event.args.owner}`} size = {0} />
              <NoteText message = {`Address: ${transaction.event.args.program}`} size = {0} />
              <NoteText message = {`Version: ${transaction.event.args.version}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'AllowedGiftSet': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <SquaresPlusIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Gift access changed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }
              size={0}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Gift: ${transaction.event.args.loyaltyGift}`} size = {0} />
              <NoteText message = {`Exchangeable: ${transaction.event.args.exchangeable}`} size = {0} />
              <NoteText message = {`Redeemable: ${transaction.event.args.redeemable}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'LoyaltyPointsExchangeForGift': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <GifIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Loyalty points exchanged for gift"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }
              size={0}  
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {0} />
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {0} />
              <NoteText message = {`Gift ID: ${transaction.event.args.giftId}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'LoyaltyGiftRedeemed': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <SparklesIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Gift voucher redeemed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }
              size={0}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {0} />
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {0} />
              <NoteText message = {`Gift ID: ${transaction.event.args.giftId}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'LoyaltyCardBlocked': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <ShieldExclamationIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Loyalty card (un)blocked"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={0} 
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {0} />
              <NoteText message = {`Blocked: ${transaction.event.args.blocked}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'CreationCardsAllowed': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <ClipboardDocumentCheckIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Creation loyalty cards (dis)allowed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={0}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Creation cards allowed: ${transaction.event.args.allowed}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'GiftsMinted': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <BuildingOfficeIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Gifts minted"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={0}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {0} />
              <NoteText message = {`Amount: ${transaction.event.args.amount}`} size = {0} />
            </div>
          </div>
        </section>
      )
    }
    case 'ImageUriChanged': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <PhotoIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Image uri changed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={0}
            />
          </div>
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
