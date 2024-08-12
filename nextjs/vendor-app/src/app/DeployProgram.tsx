import EmblaCarousel from '../components/application/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import { ChangeEvent, useEffect, useState } from "react"
import { NoteText, TitleText } from "../components/ui/StandardisedFonts"
import { TabChoice } from "../components/ui/TabChoice"
import { HexColorPicker } from "react-colorful"
import { InputBox } from "../components/ui/InputBox"
import Image from "next/image";
import { Button } from "../components/ui/Button"
import { Hex, toHex, toBytes } from "viem"
import { useAccount, useWriteContract, useWatchContractEvent } from "wagmi"
import { factoryProgramsAbi, loyaltyGiftAbi } from "@/context/abi"
import { parseEthAddress, parseDeployProgramLogs } from "../utils/parsers"
import { fromHexColourToBytes } from '../utils/transformData'

export const DeployProgram = () => {
  const [ name, setName ] = useState<string | undefined>() 
  const [ base, setBase ] = useState<string>("#2f4632") 
  const [ accent, setAccent ] = useState<string>("#a9b9e8") 
  const [ uri, setUri ] = useState<string>("www.somewhere.io") 
  const [ tab, setTab ] = useState<string>("Base") 
  const { writeContract } = useWriteContract()

  const OPTIONS: EmblaOptionsType = {}

  useWatchContractEvent({
    address: '0xD4eA33DF95698E5240C35c81e7a5FeA6164D842b',
    abi: factoryProgramsAbi,
    eventName: 'ProgramDeployed',
    onLogs(logs) {
      console.log('New logs!', logs) // parseDeployProgramLogs(logs)
    },
  })

  const nameProgram: React.JSX.Element = (
    <>
      <div>
        <TitleText 
          title = "Program name"
          subtitle = "Add a name for your program."
          size = {1} 
          /> 
        
        <NoteText 
          message = "Required. This name CANNOT be changed after deployment."
          size = {0}
          /> 
      </div>

      <InputBox
        nameId = "name"
        placeholder={"Enter a name here."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} // this needs a parser.... 
      />

      <div />  
    </>
  )

  const colourProgram: React.JSX.Element = (
    <>
      <TitleText 
        title = "Colour picker"
        subtitle = "Choose the colour scheme of your program."
        size = {1} 
        /> 
      
      <NoteText 
        message = "The colour scheme can NOT be changed after deployment."
        size = {0}
        /> 

      <TabChoice 
        optionOne = "Base"
        optionTwo = "Accent"
        onChange={(choice) => setTab(choice) }
      />

      <section className="responsive-width p-2">
        <HexColorPicker color={ tab == "Base" ? base : accent }
        onChange={tab == "Base" ? setBase : setAccent} />
      </section>

      <section className="w-full h-fit p-2">
        <div 
          className="grid grid-cols-1 text-md text-center border content-center rounded-lg p-2 h-12"
          style = {{color: accent, borderColor: accent, backgroundColor: base }} 
          > 
          {name}
        </div>
      </section>
    </>
  )

  const uriProgram: React.JSX.Element = (
    <> 
      <div> 
        <TitleText 
          title = "Program image"
          subtitle = "Choose an image of your program."
          size = {1} 
          /> 
        
        <NoteText 
          message = "Optional. The image can be changed after deployment."
          size = {0}
          /> 
      </div>
      <section className="h-fit w-full grid grid-cols-1 p-2 place-items-center content-center">
        <div 
          className="w-fit h-fit text-md text-center border-4 rounded-lg p-6"
          style = {{color: accent, borderColor: accent, backgroundColor: base }}  
          >
          <Image
              className="w-full"
              width={100}
              height={100}
              style = {{ objectFit: "fill" }} 
              src={"https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"}
              alt="No valid image detected."
            />
        </div>
      </section>

      <InputBox
        nameId = "uri"
        placeholder={"Enter a uri (https://...) to an image."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => setUri(event.target.value)} // this needs a parser.... 
      />   
    </> 
  )
  // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"

  const SLIDES = [nameProgram, colourProgram, uriProgram]
  
  return (
    <>
        <div className={`w-full h-[50vh] flex flex-col content-center max-w-lg gap-4 p-2`}> 
          <EmblaCarousel slides={SLIDES} options={OPTIONS} />
        </div>
        <div className={`w-full h-fit grid grid-cols-1 max-w-lg gap-4 px-2`}>
          <Button 
            onClick = {() =>  writeContract({ 
              abi: factoryProgramsAbi,
              address: '0xD4eA33DF95698E5240C35c81e7a5FeA6164D842b',
              functionName: 'deployLoyaltyProgram',
              args: [
                name,
                `${base};${accent}`,
                uri,
              ],
           }, 
           {
            onSuccess: (data => console.log("Deploy contract success:", data)), 
            onError:  (error => console.log("Deploy contract error:", error)), 
           }
          )
        } 

            disabled = { name == undefined } 
            >
            Deploy
          </Button>
        </div>
      </>
  )
}
