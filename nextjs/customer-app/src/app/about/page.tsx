"use client"

import { Layout } from "@/components/Layout"
import { TitleText } from "@/components/StandardisedFonts"

export default function Page() {
  
  return (
    <Layout> 
      <TitleText title = "About" size = {2} /> 
      <div className="grow grid grid-cols-1 justify-items-center p-2 border border-red-500">
        This is the about page
      </div>
    </Layout>
  )
}