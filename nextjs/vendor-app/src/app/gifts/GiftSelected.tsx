import { Button } from "@/components/ui/Button";
import { InputButton } from "@/components/ui/InputButton";
import { NumLine } from "@/components/ui/NumLine";
import { NoteText, SectionText, TitleText } from "@/components/ui/StandardisedFonts";
import { loyaltyGiftAbi, loyaltyProgramAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { wagmiConfig } from "../../../wagmi-config";
import { readContracts } from '@wagmi/core'
import { parseRequirementReply } from "@/utils/parsers";
import { transactionReceiptStatus } from "permissionless";

export const GiftSelected = ({
  address,  
  name,
  points,
  additionalReq, 
  metadata, 
  allowed
}: Gift) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const giftContract = { address: address, abi: loyaltyGiftAbi } as const
  const programContract = { address: selectedProgram.address, abi: loyaltyProgramAbi } as const
  const [selected, setSelected] = useState<boolean>(false) 
  const {connector} = useAccount(); 
  const { writeContract, data: transactionHash, variables, reset } = useWriteContract()
  const { data: receipt, isError, isSuccess: successReceipt, error: errorReceipt, status: statusReceipt } = useWaitForTransactionReceipt(
    {  confirmations: 1, hash: transactionHash }
  )
  const { data, error: errorReadContract, status, refetch } = useReadContracts({
    contracts: [
      {...giftContract, 
        functionName: 'balanceOf',
        args: [selectedProgram.address]
      }, 
      {...giftContract, 
        functionName: 'requirementsExchangeMet',
        args: [selectedProgram.address]
      }, 
      {...giftContract, 
        functionName: 'requirementsRedeemMet',
        args: [selectedProgram.address]
      },
      {...programContract, 
        functionName: 'allowedGifts',
        args: [address]
      },
      {...giftContract, 
        functionName: 'tokenOfOwnerByIndex',
        args: [selectedProgram.address, 0]
      },
    ]
  })

  console.log({variables})
 
  const requirements = data?.map(item => {
    return parseRequirementReply(item.error)
  }) 

  console.log(data ? data[4]?.result : "no data")

  useEffect(() => {
    if (statusReceipt == "success") {
      refetch() 
    }
  }, [statusReceipt, refetch])

  return (
    <main 
      className="flex flex-col border-b"
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} 
    >
      <button 
        className={`w-full h-fit flex flex-row items-center aria-selected:h-fit p-2`} 
        style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} 
        onClick={() => setSelected(!selected)}
        aria-disabled = {selected}
        >
        <Image
          className="w-fit h-fit rounded-lg p-2"
          width={90}
          height={90}
          style = {{ objectFit: "fill" }} 
          src={metadata?.imageUri ? metadata.imageUri : ""} 
          alt="No valid image detected."
        />
        <div className="flex flex-col">
          <SectionText
          text={name}
          subtext={`${points == 0 ? "" : `${points} points`} ${additionalReq ? `+ ${additionalReq}` : ""}`}
          size = {1} 
          /> 
          <NoteText 
          message = {metadata ? metadata.description : "No description available"} 
          size = {1}
          />  
        </div>
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className="z-1 w-full flex flex-col px-2 h-1 opacity-0 disabled aria-selected:opacity-100 aria-selected:h-80 ease-in-out duration-300 delay-300"
        aria-selected = {selected}
        style = {selected ? {} : {pointerEvents: "none"}}
        > 
        {/* {selected ?  */}
        <>
        <section className="pb-2">
        <NoteText
            message = {`Address gift: ${address}`} 
            size = {1}
          /> 
        </section>
        <section className="pb-2">
        <NoteText
            message = {`Available gifts: ${ data ? Number(data[0].result): 0}`} 
            size = {1}
          /> 
        </section>
        <section className="pb-4 h-24">
          <NoteText
            message = "Additional requirements" 
            size = {1}
          /> 
          <NoteText 
            message = {
              `Claim: ${
              additionalReq && String(metadata?.attributes[0].value).length > 0 ? 
              metadata?.attributes[0].value 
              :
              "none"}`
            }
            size = {0}
          />
          <NoteText 
            message = {
              `Redeem: ${
              additionalReq && String(metadata?.attributes[1].value).length > 0 ? 
              metadata?.attributes[1].value 
              :
              "none"}`
            }
            size={0}
          />
        </section>
            
          <div className="px-2 min-h-10 my-2"> 
            <NumLine 
            statusButton={variables?.functionName == 'mintGifts' ? statusReceipt : 'idle'}
            onClick={(amount) =>  writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'mintGifts',
                args: [
                  address,
                  amount
                ]
              })
            } 
            size = {0} 
            aria-disabled = {selected}/>
          </div>

          {
          requirements && requirements[1] != "Not implemented" ? 

          <>
            <div className="px-2 my-2 min-h-10 h-fit flex flex-row gap-2"> 
              <Button 
              statusButton={ variables?.functionName == 'setAllowedGift' ? statusReceipt : 'idle'} 
              onClick={() => writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'setAllowedGift',
                args: [
                  address,
                  false,
                  true
                ]
                })
              }
              size = {0}
              aria-disabled = {selected}
              >
              Disallow claiming gift   
              </Button>
            </div> 
          </>
          : 
          data ? 
            <div className="px-2 my-2 min-h-10 h-fit flex">
              <InputButton 
              nameId ={"directTransfer"}
              statusNumline={variables?.functionName == 'transferGift' ? statusReceipt : 'idle'}
              onClick = {(inputAddress) =>  writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'transferGift',
                args: [
                  inputAddress as `0x${string}`,
                  address,
                  data[4].result 
                ]
              })}
              buttonText="Direct transfer"
              placeholder="Customer address"
              size = {0}
              aria-disabled = {data[4].result == undefined}
              />
            </div>
          : 
            null
          } 
          </> 
        </div>
  </main>
  );
};

