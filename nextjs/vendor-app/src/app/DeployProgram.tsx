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
import { useWriteContract, useWatchContractEvent, useChainId } from "wagmi"
import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi"
import { parseDeployLogs, parseString } from "../utils/parsers"
import { Program, Status } from '@/types'
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'
import { chainSettings } from '@/context/chainSettings'
import { publicClient } from '@/context/clients'
import useWatchEvent from '@/hooks/useWatchEvent'

export const DeployProgram = () => {
  const [ name, setName ] = useState<string | undefined>() 
  const [ base, setBase ] = useState<string>("#2f4632") 
  const [ accent, setAccent ] = useState<string>("#a9b9e8")
  const [ uri, setUri ] = useState<string | undefined>() 
  const [ tab, setTab ] = useState<string>("Base") 
  const { writeContract } = useWriteContract()
  const { watchEvent, error, eventLog, status: watchStatus} = useWatchEvent() 
  const chainId = useChainId() 
  const deployed = chainSettings(chainId) 
  const programsFactory: Hex = deployed ? deployed.factoryProgramsAddress : '0x0'

  const OPTIONS: EmblaOptionsType = {}
  const savedPrograms = useRef<Program[]>([]) ; 

  useEffect(()=>{
    if ( eventLog && watchStatus == "success") {
      handlePostDeployment([eventLog])
    }
  }, [eventLog, watchStatus])

  useEffect(()=>{
    let localStore = localStorage.getItem("clp_v_programs")
    savedPrograms.current = localStore ? JSON.parse(localStore) : []
  }, [])


  const handlePostDeployment = async (log: Log[]) => {
    const deployEvents = parseDeployLogs(log)
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

      if (
        programInfo[0].status == "success" && 
        programInfo[1].status == "success" && 
        programInfo[2].status == "success"
      ) {
        savedPrograms.current.push({
          address: deployEvents[0].args.programAddress, 
          version: "alpha.2", 
          name: parseString(programInfo[0].result), 
          colourBase: parseString(programInfo[1].result).split(`;`)[0], 
          colourAccent: parseString(programInfo[1].result).split(`;`)[1], 
          uriImage: parseString(programInfo[2].result), 
          events: {
            startBlock: 0,
            endBlock: 0,
            genesisReached: false, 
            events: []
          }
        })
        localStorage.setItem("clp_v_programs", JSON.stringify(savedPrograms.current)); 
      } else {
        console.log("error data: ", programInfo)
      }
  }

  const parseImage = async (src: string) => { // I have this now also in parsers. replace at a later stage.     
    const res = await fetch(src);
    const buff = await res.blob();
    const isImage = buff.type.startsWith('image/png')

    if (isImage) {
      setUri(src)
    } else {
      setUri("/logo.png") // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC") 
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
          align={1}
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
        align={1}
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
          align={1}
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
          align={1}
          /> 

      <InputBox
        nameId = "uri"
        placeholder={"Enter a uri (https://...) to an image."}
        onChange = {(event: ChangeEvent<HTMLInputElement>) => parseImage(event.target.value)} 
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
        <div className={`w-full h-10 flex flex-row px-2`}>
          <Button 
              statusButton={watchStatus}
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
                  onSuccess: () => watchEvent("ProgramDeployed"), 
                  onError:  (error => console.log(error))
                }
                )
              }>
              Deploy
          </Button>
        </div>
      </>
  )
}
