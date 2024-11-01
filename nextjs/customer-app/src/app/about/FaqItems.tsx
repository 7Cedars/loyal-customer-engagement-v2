import {  SectionText } from "@/components/StandardisedFonts";

export const Knowledge = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="No. As a customer you do not interact with blockchains. This app will feel like any other app."
      />
    </section>
)}

export const Payment = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="No. Your vendor covers all costs associated with use of this app."
      />
    </section>
)}

export const NoGifts = () => {
  return (
    <section className="my-2"> 
      <SectionText 
      size={1}
      text=""
      subtext="Your vendor needs to whitelist gifts for you to be able to exchange them. If you do not see any gifts, please contact your vendor and ask to whitelist one or more gifts. "
      />
    </section>
)}
