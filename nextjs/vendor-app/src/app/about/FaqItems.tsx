import {  SectionText } from "@/components/ui/StandardisedFonts";

export const Knowledge = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="As a vendor you need to have some limited knowledge of web3. Specifically, you need to know how to use a web3 wallet. That's it. It will feel very much like a normal dApp."
      />
    </section>
)}

export const KnowledgeCustomer = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="No. Your customers will not even realise they are interacting with a blockchain."
      />
    </section>
)}

export const Payment = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="Yes, as a vendor you fund interactions in your customer engagement app. It is hard to give an estimate, as you pay for what you and your customers use. But for general use (up to a hundred customers, with around one interaction per day) it will not exceed fifty pounds per month."
      />
    </section>
)}

export const PaymentCustomer = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="No. You, as vendor, cover the gas cost of customer that use your program. This normally cost less than one pence per interaction."
      />
    </section>
)}

export const NoGifts = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="Your vendor needs to whitelist gifts for you to be able to exchange them. If you do not see any gifts, please contact your vendor and ask to whitelist one or more gifts."
      />
    </section>
)}
