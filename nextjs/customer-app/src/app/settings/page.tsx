"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "@/components/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)

  return (
    <Layout> 
      <TitleText title = "Settings" size = {2} /> 
      <div className="grow grid grid-cols-1 justify-items-center p-2 border border-red-500">
        This is the settings page
      </div>
    </Layout>
  )
}