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
  SparklesIcon,
  BuildingLibraryIcon, 
  BanknotesIcon,
  GiftTopIcon

} from "@heroicons/react/24/outline";


type TransactionEvent = Omit<Event, 'address' | 'blockNumber' | 'logIndex'>

export const TransactionInfo = (transaction: TransactionEvent) => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const layoutItem = "w-full h-fit flex flex-row items-center p-2 border-b"
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
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`From: ${transaction.event.args.sender}`} size = {1} />
              <NoteText message = {`Amount: ${transaction.event.args.value / 1e18} eth`} size = {1} />
            </div>
          </div>
        </section>
      )
    }
    case 'LoyaltyProgramDeployed': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <BuildingLibraryIcon
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
              size={1}  
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Owner: ${transaction.event.args.owner}`} size = {1} />
              <NoteText message = {`Address: ${transaction.event.args.program}`} size = {1} />
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
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Gift: ${transaction.event.args.loyaltyGift}`} size = {1} />
              <NoteText message = {`Exchangeable: ${transaction.event.args.exchangeable}`} size = {1} />
              <NoteText message = {`Redeemable: ${transaction.event.args.redeemable}`} size = {1} />
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
              text = {"Gift claimed"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              }
              size={1}  
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {1} />
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {1} />
              <NoteText message = {`Gift ID: ${transaction.event.args.giftId}`} size = {1} />
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
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {1} />
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {1} />
              <NoteText message = {`Gift ID: ${transaction.event.args.giftId}`} size = {1} />
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
              size={1} 
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Customer: ${transaction.event.args.customer}`} size = {1} />
              <NoteText message = {`Blocked: ${transaction.event.args.blocked}`} size = {1} />
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
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Creation cards allowed: ${transaction.event.args.allowed}`} size = {1} />
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
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Gift: ${transaction.event.args.gift}`} size = {1} />
              <NoteText message = {`Amount: ${transaction.event.args.amount}`} size = {1} />
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
              size={1}
            />
          </div>
        </section>
      )
    }
    case 'Transfer': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <BanknotesIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Points transferred"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`From: ${transaction.event.args.from}`} size = {1} />
              <NoteText message = {`To: ${transaction.event.args.to}`} size = {1} />
              <NoteText message = {`Points: ${transaction.event.args.value}`} size = {1} />
            </div>
          </div>
        </section>
      )
    }
    case 'GiftTransferred': {
      return (
        <section className= {layoutItem} style = {{borderColor: prog.colourAccent}}>
          <GiftTopIcon
                className={layoutIcons}
                style={{color:prog.colourAccent}} // instead of using aria selected, I can make opacity conditional here. 
              />
          <div className="flex flex-col gap-2 items-start">
            <SectionText
              text = {"Gift transferred"}
              subtext = {
                `${toFullDateFormat(transaction.event.blockData.timestamp)}, 
                 ${toEurTimeFormat(transaction.event.blockData.timestamp)}`
              } 
              size={1}
            />
            <div className="flex flex-col gap-1 items-start"> 
              <NoteText message = {`Gift address: ${transaction.event.args.gift}`} size = {1} />
              <NoteText message = {`Gift Id: ${transaction.event.args.giftId}`} size = {1} />
              <NoteText message = {`Customer: ${transaction.event.args.to}`} size = {1} />
            </div>
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
