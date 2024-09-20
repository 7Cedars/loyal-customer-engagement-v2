import EmblaCarousel from '../components/application/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { NoteText, TitleText } from "../components/ui/StandardisedFonts"
import { TabChoice } from "../components/ui/TabChoice"
import { HexColorPicker } from "react-colorful"
import { InputBox } from "../components/ui/InputBox"
import Image from "next/image";
import { Button } from "../components/ui/Button"
import { Hex, Log } from "viem"
import { useWriteContract, useWatchContractEvent } from "wagmi"
import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi"
import { parseEthAddress, parseDeployLogs, parseString } from "../utils/parsers"
import { fromHexColourToBytes } from '../utils/transformData'
import { Program, Status } from '@/types'
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'

type ImageLoaderProps = {
  src: string; 
  width: number; 
  quality: number; 
}

export const DeployProgram = () => {
  const [ name, setName ] = useState<string | undefined>() 
  const [ base, setBase ] = useState<string>("#2f4632") 
  const [ status, setStatus ] = useState<Status>("isIdle") 
  const [ accent, setAccent ] = useState<string>("#a9b9e8")
  const [ uri, setUri ] = useState<string | undefined>() 
  const [ tab, setTab ] = useState<string>("Base") 
  const { writeContract } = useWriteContract()
  const cardsFactory: Hex = parseEthAddress(process.env.NEXT_PUBLIC_CARDS_FACTORY) 
  const programsFactory: Hex = parseEthAddress(process.env.NEXT_PUBLIC_PROGRAMS_FACTORY) 

  const OPTIONS: EmblaOptionsType = {}
  const savedPrograms = useRef<Program[]>([]) ; 

  useEffect(()=>{
    let localStore = localStorage.getItem("clp_v_programs")
    savedPrograms.current = localStore ? JSON.parse(localStore) : []
  }, [])

  const handlePostDeployment = async (logs: Log[]) => {
    const deployEvents = parseDeployLogs(logs)
    console.log("deployEvents: ", deployEvents)

    const deployedProgram = {
      address: deployEvents[0].args.programAddress,
      abi: loyaltyProgramAbi,
    } as const
    
    const programInfo = await readContracts(wagmiConfig, {
      contracts: [
        {
          ...deployedProgram, 
            functionName: 'name', 
        },
        {
          ...deployedProgram, 
            functionName: 'symbol', 
        },
        {
          ...deployedProgram, 
          functionName: 'imageUri', 
        }
      ], 
    })

    console.log("programInfo: ", programInfo)

      if (
        programInfo[0].status == "success" && 
        programInfo[1].status == "success" && 
        programInfo[2].status == "success"
      ) {
        savedPrograms.current.push({
          address: deployEvents[0].args.programAddress, 
          name: parseString(programInfo[0].result), 
          colourBase: parseString(programInfo[1].result).split(`;`)[0], 
          colourAccent: parseString(programInfo[1].result).split(`;`)[1], 
          uriImage: parseString(programInfo[2].result), 
        })
        localStorage.setItem("clp_v_programs", JSON.stringify(savedPrograms.current)); 
        console.log("savedPrograms:", savedPrograms.current)
        setStatus("isSuccess")
      } else {
        setStatus("isError")
        console.log("error data: ", programInfo)
      }
  }

  const handleDeploymentError = (error: any) => {
    setStatus("isError")
    console.log("Deploy contract error:", error)
  }

  useWatchContractEvent({
    address: programsFactory,
    abi: factoryProgramsAbi,
    batch: false, 
    eventName: 'ProgramDeployed',
    onLogs(logs) {
      handlePostDeployment(logs) 
    },
  })

  const parseImage = async (src: string) => { // I have this now also in parsers. replace at a later stage.     
    const res = await fetch(src);
    const buff = await res.blob();
    console.log("buff: ", buff)
    const isImage = buff.type.startsWith('image/png')

    if (isImage) {
      setUri(src)
      console.log("image successfully set")
    } else {
      setUri("/logo.png") // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC") 
      console.log("image did not pass test")
    }

  }

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

      <div className='h-20'>
        
        <InputBox
          nameId = "name"
          placeholder={"Enter a name here."}
          onChange = {(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} // this needs a parser.... 
        />
      </div>

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
           { uri ?  
            <Image
                className="w-full"
                width={100}
                height={100}
                style = {{ objectFit: "fill" }} 
                src={uri}
                alt="No valid image detected."
                onError={(e) => console.log(e)}
              /> :

              <div className={`text-center text-lg`} style = {{color: accent}}>
                 No valid image at Url
              </div>
           }
        </div>
      </section>

      <div className='h-fit flex-col'> 
      <NoteText 
          message = "Only png images allowed. Full url required, including 'https://'."
          size = {0}
          /> 

      <InputBox
        nameId = "uri"
        placeholder={"Enter a uri (https://...) to an image."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => parseImage(event.target.value)} // this needs a parser.... 
      />   
      </div>
    </> 
  )
  // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC"

  const SLIDES = [nameProgram, colourProgram, uriProgram]
  
  return (
    <>
        <div className={`w-full h-fit flex flex-col content-center max-w-lg gap-4 p-2`}> 
          <EmblaCarousel slides={SLIDES} options={OPTIONS} />
        </div>
        <div className={`w-full h-fit grid grid-cols-1 max-w-lg gap-4 px-2`}>
          { 
          status == "isLoading" ? 
            <Button disabled = {true}> 
              Loading...  
            </Button>
          :
          status == "isError" ? 
            <Button disabled = {true}> 
              Error
            </Button>
          :
            <Button 
              onClick = {() =>  writeContract({ 
                  abi: factoryProgramsAbi,
                  address: programsFactory,
                  functionName: 'deployLoyaltyProgram',
                  args: [
                    name,
                    `${base};${accent}`,
                    uri,
                  ],
                }, 
                {
                  onSuccess: () => setStatus('isLoading'), 
                  onError:  (error => handleDeploymentError(error)), 
                }
                )
              }
                disabled = { name == undefined } 
              >
              Deploy
          </Button>
        } 
        </div>
      </>
  )
}
