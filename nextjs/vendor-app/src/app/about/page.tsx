"use client"

import { Foldout } from "@/components/application/Foldout"
import { Layout } from "@/components/application/Layout"
import { NoteText, TitleText } from "@/components/ui/StandardisedFonts"
import { useAppSelector } from "@/redux/hooks"
import { Knowledge, KnowledgeCustomer, NoGifts, Payment, PaymentCustomer } from "./FaqItems"
import { useState } from "react"

export default function Page() {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)
  const [selectedItem, setSelectedItem] = useState<string>(); 
  
  return (
    <Layout> 
      <TitleText title = "About" size = {2} /> 
        <div 
          className="grow flex flex-col justify-start items-start overflow-auto p-2 mb-20"
          style = {{color: selectedProgram.colourAccent}}>
          <p className="flex flex-col justify-start gap-4 p-4">
            <a>
            Loyal is a modular framework for blockchain based customer engagement programs. 
            </a>
            <a>
            The project is meant as a Proof of Concept for a new kind of blockchain based customer engagement programs. It is meant to be used for testing purposes only.  
            </a>
          </p>

          <div className="w-full flex flex-col justify-center gap-4 p-4">
            <TitleText title = "FAQ" size = {1} /> 
            
            <Foldout 
              selected = {selectedItem == 'knowledge'} 
              onClick={() => selectedItem == 'knowledge' ? setSelectedItem(undefined) : setSelectedItem('knowledge') }
              titleText="Do I need prior knowledge about blockchains to use this app?"
              sizeFoldout={0}
              >
              <Knowledge/>
            </Foldout>

            <Foldout 
              selected = {selectedItem == 'knowledgeCustomer'} 
              onClick={() => selectedItem == 'knowledgeCustomer' ? setSelectedItem(undefined) : setSelectedItem('knowledgeCustomer') }
              titleText="Do my customers need prior knowledge about blockchains to use this app?"
              sizeFoldout={0}
              >
              <KnowledgeCustomer/>
            </Foldout>
            
            <Foldout 
              selected = {selectedItem == 'payment'} 
              onClick={() => selectedItem == 'payment' ? setSelectedItem(undefined) : setSelectedItem('payment') }
              titleText="Do I need to pay to use this program?"
              sizeFoldout={1}
              >
              <Payment/>
            </Foldout>

            <Foldout 
              selected = {selectedItem == 'paymentCustomer'} 
              onClick={() => selectedItem == 'paymentCustomer' ? setSelectedItem(undefined) : setSelectedItem('paymentCustomer') }
              titleText="Do my customers need to pay to use this program?"
              sizeFoldout={1}
              >
              <PaymentCustomer/>
            </Foldout>

            <Foldout 
              selected = {selectedItem == 'noGifts'} 
              onClick={() => selectedItem == 'noGifts' ? setSelectedItem(undefined) : setSelectedItem('noGifts') }
              titleText="I do not see any gifts I to whitelist to exchange. Why?"
              sizeFoldout={2}
              >
              <NoGifts/>
            </Foldout>

          </div>
        </div>
    </Layout>
  )
}