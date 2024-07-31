"use client"; 

import { Layout } from "@/components/application/Layout";
import { Button } from "@/components/ui/Button";
import { TitleText } from "@/components/ui/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  return (
    <Layout> 
      <TitleText title = {prog.name ? prog.name : "Home"} size = {2} /> 
      <div className="grow flex flex-col justify-start items-center border border-red-500">
        <div className="w-full sm:w-4/5 lg:w-1/2 h-12 p-2">
          <Button>
            Balance: Eth
          </Button>
        </div>
        <div className="h-full w-full flex flex-col justify-start items-center mb-12 border border-green-500">
          <div className="grow h-12 border border-purple-500">
            Here will be an (optional) image or numpad.
          </div> 
          <button 
            className="grow-0 h-12 w-full border rounded-t-full"
            style = {{borderColor: prog.colourAccent}}
            onClick={() => {}}
            >
            Here will be the bottom drawer.
          </button> 
        </div>
      </div>
    </Layout>
  )
}