import { Button } from "../../components/Button";
import {  SectionText } from "@/components/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export const ClearLocalStorage = () => {
  const [cleared, setCleared] = useState<boolean>(false);
  const handleClearLocalStorage = () => { 
    setCleared(true)
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
        <Button 
          onClick={() => handleClearLocalStorage()}
          statusButton="idle"
          >
          {cleared ? "Local storage cleared" : "Yes, delete Local Storage." } 
        </Button>
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
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)

  return (
    <section className="my-2"> 
      <SectionText 
      text="The address of this loyalty program is:"
      subtext={prog.address}
      />
       <div className="pt-6 p-1">
          <QRCode 
            value={ prog.address ? prog.address : '0x0'}
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

export const ShowCardAddress = () => {
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, pending, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 

  useEffect(() => {
    if (prog.address && embeddedWallet) 
    fetchLoyaltyCard(
      prog.address, 
      123456n, 
      embeddedWallet
    ) 
  }, [prog, embeddedWallet, fetchLoyaltyCard])

  return (
    <section className="my-2"> 
      { loyaltyCard ? 
      <>
        <SectionText 
        text="The address of this loyalty card is:"
        subtext={loyaltyCard.address}
        />
        <div className="pt-6 p-1">
            <QRCode 
              value={loyaltyCard.address}
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
        </>
        :
        <>
          <SectionText 
          text="Loading address of loyalty card."
          />
          <div className="pt-6 p-1">
              <QRCode 
                value={ '0x0'}
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
          </>
        }
    </section>
)}

export const ExportWalletKey = () => {
  const {ready, authenticated, user, exportWallet} = usePrivy();
  // Check that your user is authenticated
  const isAuthenticated = ready && authenticated;
  // Check that your user has an embedded wallet
  const hasEmbeddedWallet = !!user?.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.walletClientType === 'privy',
  );

  console.log({hasEmbeddedWallet, isAuthenticated})

  return (
    <section className="my-2"> 
      <SectionText 
      text="Are you sure you want to export your secret wallet key?"
      subtext=""
      />
      <div className="flex h-12 max-w-96 w-full mt-6 z-20">
        <Button 
          onClick={exportWallet} 
          statusButton = {"idle"}
          >
          Export Wallet
        </Button>
      </div>
    </section>
)}


export const ShowCardOwner = () => {
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  return (
    <section className="my-2"> 
    { embeddedWallet ? 
      <>
        <SectionText 
        text="The address of the owner of this loyalty card is:"
        subtext={embeddedWallet.address}
        />
        <div className="pt-6 p-1">
            <QRCode 
              value={embeddedWallet.address}
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
        </>
          :
          <SectionText 
          text="Loading the address of the owner of this loyalty card."
          />
        }
    </section>
)}

export const AboutSection = () => {
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)

  return (
    <section className="my-2"> 
      <SectionText 
      text="Want to know more?"
      />
      <div className="flex h-12 max-w-96 w-full mt-6 z-10">
      <Link 
          href='/about' 
          className={`w-full h-full grid grid-cols-1 text-md text-center border content-center rounded-lg p-2 h-12 z-30`} 
          style={{color: prog.colourAccent, borderColor: prog.colourAccent}}
          >
          Visit the about section      
          </Link>
      </div>
    </section>
)}

export const Logout = () => {
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)

  return (
    <section className="my-2"> 
      <SectionText 
      text="Do you really want to exit?"
      />
      <div className="flex h-12 max-w-96 w-full mt-6 z-10">
      <Link 
          href='/' 
          className={`w-full h-full grid grid-cols-1 text-md text-center border content-center rounded-lg p-2 h-12 z-30`} 
          style={{color: prog.colourAccent, borderColor: prog.colourAccent}}
          >
          Logout 
      </Link>
      </div>
    </section>
)}
