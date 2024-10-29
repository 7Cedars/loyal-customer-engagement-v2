"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "@/components/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"

export default function Page() {
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)

  return (
    <Layout> 
      <TitleText title = "About" size = {2} /> 
      <div className="grow grid grid-cols-1 justify-items-center p-2 border border-red-500">
        This is the about page
      </div>
    </Layout>
  )
}