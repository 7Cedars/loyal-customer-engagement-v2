import { Button } from "@/components/ui/Button";
import { InputBox } from "@/components/ui/InputBox";
import { NoteText, SectionText, TitleText } from "@/components/ui/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { useWriteContract } from 'wagmi'
import { loyaltyProgramAbi } from "@/context/abi";

export const ClearLocalStorage = () => {
  const [cleared, setCleared] = useState<boolean>(false);
  const handleClearLocalStorage = () => { 
    setCleared(true)
    localStorage.removeItem("clp_v_events")  
    localStorage.removeItem("clp_v_gifts")  
    localStorage.removeItem("clp_v_programs")  
  }

  return (
    <section className="my-2"> 
      <SectionText 
      text="Are you sure you want to clear local storage?"
      subtext="This will mean you loose all stored programs, gifts and transaction history. It can be difficult to restore."
      />
      <div className="flex h-12 max-w-96 w-full mt-6">
        <Button onClick={() => handleClearLocalStorage()}>
          {cleared ? "Local storage cleared" : "Yes, delete Local Storage." } 
        </Button>
      </div>
    </section>
)}

export const ChangeProgramImage = () => {
  const [ uri, setUri ] = useState<string | undefined>() 
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const { writeContract, error, isError, isSuccess, failureReason } = useWriteContract()

  console.log("error: ", error)

  const parseImage = async (src: string) => { // I have this now also in parsers. replace at a later stage.     
    const res = await fetch(src);
    const buff = await res.blob();
    console.log("buff: ", buff)
    console.log("failureReason: ", failureReason)
    const isImage = buff.type.startsWith('image/png')

    if (isImage) {
      setUri(src)
      console.log("image successfully set")
    } else {
      setUri("/logo.png") // "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmaGkjPQq1oGBfYfazGTBM96pcG1AoH3xYBMkNAgi5MfjC") 
      console.log("image did not pass test")
    }
  }

  return (
    <section className="my-2"> 
      <TitleText 
      title = "Program image"
      subtitle = "Choose an image of your program."
      />
            <section className="h-fit w-full grid grid-cols-1 p-2 place-items-center content-center">
        <div 
          className="w-fit h-fit text-md text-center border-4 rounded-lg p-6"
          style = {{color: prog.colourAccent, borderColor: prog.colourAccent, backgroundColor: prog.colourBase }}  
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

              <div className={`text-center text-lg`} style = {{color: prog.colourAccent}}>
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
        onChange = {(event: ChangeEvent<HTMLInputElement>) => parseImage(event.target.value)} 
      />   
        <div 
          className="flex h-12 max-w-96 w-full mt-6"
          >
          <Button 
            disabled = {!uri || uri.length == 0 }
            onClick={() => writeContract({
              abi: loyaltyProgramAbi, 
              address: prog.address, 
              functionName: 'setImageUri', 
              args: [uri]
            })
          }>
            {isError ? `Error` : "Update image"}
          </Button>
        </div>
      </div>
    </section>
)}

export const Disclaimer = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      text="This program comes with no warranties what so ever."
      subtext="The code is under active development, has not been properly tested. It is only meant for demonstration purposes."
      />
    </section>
)}

export const ShowProgramAddress = () => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  return (
    <section className="my-2"> 
      <SectionText 
      text="The address of this loyalty program is:"
      subtext={prog.address}
      />
       <div className="pt-6 p-1">
          <QRCode 
            value={prog.address}
            style={{ 
              height: "250px", 
              width: "250px", 
              objectFit: "cover", 
              background: 'white', 
              padding: '16px', 
            }}
            bgColor="#ffffff" // "#0f172a" 1e293b
            fgColor="#000000" // "#e2e8f0"
            level='M'
            className="rounded-lg"
          />
        </div>
    </section>
)}

export const ExitProgram = () => {
  const router = useRouter()

  return (
    <section className="my-2"> 
      <SectionText 
      text="Do you really want to exit?"
      />
      <div className="flex h-12 max-w-96 w-full mt-6">
        <Button onClick={() => router.push('/')}>
          Yes, exit loyalty program. 
        </Button>
      </div>
    </section>
)}
