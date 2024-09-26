import { Button } from "@/components/ui/Button";
import { InputButton } from "@/components/ui/InputButton";
import { NumLine } from "@/components/ui/NumLine";
import { NoteText, SectionText, TitleText } from "@/components/ui/StandardisedFonts";
import { loyaltyGiftAbi, loyaltyProgramAbi } from "@/context/abi";
import { useAppSelector } from "@/redux/hooks";
import { Gift } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { wagmiConfig } from "../../../wagmi-config";
import { readContracts } from '@wagmi/core'

export const GiftSelected = ({
  address,  
  name,
  points,
  additionalReq, 
  metadata, 
}: Gift) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selected, setSelected] = useState<boolean>(false) 
  const {connector} = useAccount(); 
  const { writeContract, error, data: transactionHash } = useWriteContract()
  const { data: receipt, isError: isErrorReceipt, isLoading: isLoadingReceipt, isSuccess: isSuccessReceipt, error: errorReceipt } = useWaitForTransactionReceipt(
    {  confirmations: 1, hash: transactionHash })
  const { data, isError, error: errorReadContract, isLoading, status, refetch } = useReadContract({
    address: address,
    abi: loyaltyGiftAbi,
    functionName: 'balanceOf',
    args: [selectedProgram.address]
  })

  const fetchOwnedTokenId = useCallback(
    async (ownerAddress: `0x${string}`, giftAddress: `0x${string}`) => {
      const giftContract = {
        address: giftAddress,
        abi: loyaltyGiftAbi,
      } as const

      try {      
        const result = await readContracts(wagmiConfig, {
          contracts: [
            {
              ...giftContract,
              functionName: 'tokenOfOwnerByIndex',
              args: [ownerAddress, 0]
            },
          ]
        })
        console.log(result)
          // if (result && result[0].status == 'success') {     
          //   setAllowedGifts(result[0].result as `0x${string}`[]) 
          // } 
      } catch(error) {
        console.log(error)
      }
    }, []
  )

  console.log({ data, isError, isLoading, status, transactionHash, error, receipt, isErrorReceipt, isSuccessReceipt, errorReceipt, connector })



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
          subtext={`${points} points ${additionalReq ? `+ ${additionalReq}` : ""}`}
          size = {1} 
          /> 
          <NoteText 
          message = {metadata ? metadata.description : "No description available"} 
          size = {1}
          />  
          {/* <NoteText 
          message = {additionalReq ? "See extended description for additional requirements" : "No additional requirements"} 
          size = {1}
          />   */}
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
        <SectionText
            text = {`Available gifts: ${Number(data)}`} 
            size = {0}
          /> 
        </section>
        <section className="pb-4 h-24">
          <SectionText
            text = "Additional requirements" 
            size = {0}
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
            
        <SectionText
          text = "Gift actions" 
          size = {0}
        /> 
          <div className="p-2"> 
            <NumLine onClick={(amount) =>  writeContract({ 
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

          <div className="p-2 flex flex-row gap-2"> 
            <Button onClick={() => writeContract({ 
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
              Disallow customers to claim gift in exchange for points   
            </Button>
   
            <Button onClick={() => writeContract({ 
                abi: loyaltyProgramAbi,
                address: selectedProgram.address,
                functionName: 'setAllowedGift',
                args: [
                  address,
                  false,
                  false
                ]
              })
            }
            size = {0}
            aria-disabled = {selected}
            >
              Disallow customers to claim and redeem gift   
            </Button>

            <Button onClick={() => fetchOwnedTokenId(
              selectedProgram.address, '0x051472E0c61b12beB86Eab55242a090d3ffa31C3' as `0x${string}`)
            }
            size = {0}
            aria-disabled = {selected}
            >
              Test fetchOwnedTokenId
            </Button>
          </div>

          <div className="p-2">
            <InputButton 
            nameId ={"directTransfer"}
            onClick = {(inputAddress) =>  writeContract({ 
              abi: loyaltyProgramAbi,
              address: selectedProgram.address,
              functionName: 'transferGift',
              args: [
                inputAddress as `0x${string}`,
                address,  
                0n // TO DO: fetch onwed tokenId, then transfer. 
              ]
            })}
            buttonText="Direct transfer"
            placeholder="Customer card address"
            size = {0}
            aria-disabled = {selected}
            />
          </div>
        </>
        {/* : */}
        {/* null */}
        {/* } */}
      </div> 
  </main>
  );
};

