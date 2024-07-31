import EmblaCarousel from './components/app/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import { ChangeEvent, useState } from "react"
import { NoteText, TitleText } from "./components/ui/StandardisedFonts"
import { TabChoice } from "./components/ui/TabChoice"
import { HexColorPicker } from "react-colorful"
import { InputBox } from "./components/ui/InputBox"
import Image from "next/image";
import { Button } from "./components/ui/Button"
import { Hex, toHex, toBytes } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { loyaltyProgramAbi } from "@/context/abi"
import { loyaltyProgramBytecode } from "@/context/bytecode"
import { parseEthAddress, parseHex } from "./utils/parsers"

export const DeployProgram = () => {
  const [ name, setName ] = useState<string | undefined>() 
  const [ base, setBase ] = useState<string>("#2f4632") 
  const [ accent, setAccent ] = useState<string>("#a9b9e8") 
  const [ uri, setUri ] = useState<string>("") 
  const [ tab, setTab ] = useState<string>("Base") 
  const { data: walletClient } = useWalletClient();
  // const { deployContract } = useDeployContract()
  const { chain, address } = useAccount() 
  const [transactionHash, setTransactionHash] = useState<Hex>(); 

  const OPTIONS: EmblaOptionsType = {}

  const handleDeploy = async() => {
    if (walletClient) {
      const hash = await walletClient.deployContract({
        abi: loyaltyProgramAbi,
        args: [
          name,
          uri,
          toBytes(base),  // NB! needs to be bytes! 
          toBytes(accent), // NB! needs to be bytes! 
          parseEthAddress("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789")
        ],
        bytecode: loyaltyProgramBytecode,
      })
      setTransactionHash(hash)
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
        message = "The colour scheme can be changed after deployment."
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
            onClick = {() => handleDeploy()}   
            //   deployContract({ // this is a new hook that does not seem to work properly yet. £todo: File bug report? 
            //     abi: loyaltyProgramAbi,
            //     args: [
            //       name,
            //       uri,
            //       base, 
            //       accent, 
            //       parseEthAddress("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789")
            //     ],
            //     bytecode: loyaltyProgramBytecode,
            //   })
            // }
            disabled = { name == undefined } 
            >
            Deploy
          </Button>
        </div>
      </>
  )
}
