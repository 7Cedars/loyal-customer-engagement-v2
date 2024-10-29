"use client";

import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useAppSelector } from '@/redux/hooks';
import { 
  GiftIcon, 
  HomeIcon, 
  Cog6ToothIcon, 
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from "react";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";


type NavbarProps = {
  path: string; 
  base: string; 
  accent: string; 
}
 
const NavbarTop = ({path, base, accent}: NavbarProps) => {
  const {cardExists} = useAppSelector(state => state.loyaltyCard) 

  return (
    <header className="absolute w-screen top-0 z-20 flex flex-row justify-around h-18 text-sm px-6 pt-2">
      <Link 
        href='/about' 
        aria-selected={path == `/about`}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100"}
        style={{color:accent}}
        >
        About
      </Link>
      
      <Link 
        href='/home' 
        aria-selected={path == `/home`}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100"} 
        style={{color:accent}}
        >
        Home 
      </Link>

      <Link 
        href='/exchangePoints' 
        aria-selected={path == `/exchangePoints`}
        aria-disabled={!cardExists}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100 aria-disabled:opacity-10"}
        style={cardExists ? {color:accent} : {color:accent, pointerEvents: "none"}}
        >
        Exchange Points
      </Link>

      <Link 
        href='/redeemGifts' 
        aria-selected={path == `/redeemGifts`}
        aria-disabled={!cardExists}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100 aria-disabled:opacity-10"}
        style={cardExists ? {color:accent} : {color:accent, pointerEvents: "none"}}
        >
        Redeem Gifts
      </Link>
      
      <Link 
        href='/settings' 
        aria-selected={path == `/settings`}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100"}
        style={{color:accent}}
        >
        Settings 
      </Link>

      <Link 
        href='/' 
        aria-selected={path == `/`}
        className={"p-3 px-6 opacity-25 aria-selected:opacity-100"}
        style={{color:accent}}
        >
        Exit 
      </Link>
    </header>
    );
  }

  const NavbarBottom = ({path, base, accent}: NavbarProps) => {
      const {cardExists} = useAppSelector(state => state.loyaltyCard) 
      const layoutIconBox: string = 'col-span-1 grid text-xs justify-items-center'
      const layoutIcons: string = 'h-7 w-7'
    
      return (
        <header 
          className="absolute bottom-0 z-20 flex justify-between h-16 w-full text-sm px-4"
          style={{color:accent, backgroundColor:base}}
          >
        <Link 
          href={"/home"}
          aria-selected={path == "/home"}
          className={"py-2 opacity-50 aria-selected:opacity-100 w-6"}
          > 
            <div className='col-span-1 grid text-xs justify-items-center'> 
                <HomeIcon
                  className={layoutIcons}
                  style={{color:accent}} // instead of using aria selected, I can make opacity conditional here. 
                />
              Home
            </div> 
         </Link>
          <Link 
          href={"/exchangePoints"} 
          aria-selected={path == "/exchangePoints" } 
          aria-disabled={!cardExists}
          className={"py-2 opacity-50 aria-selected:opacity-100 w-6 aria-disabled:opacity-10"}
          style={cardExists ? {} : {pointerEvents: "none"}}
          >
            <div className={layoutIconBox}> 
              <ShoppingCartIcon
              className={layoutIcons}
              style={{color:accent}}
              />
            Exchange   
            </div>  
         </Link>
         <Link 
          href={"/redeemGifts"} 
          aria-selected={path == "/redeemGifts" } 
          aria-disabled={!cardExists}
          style={cardExists ? {} : {pointerEvents: "none"}}
          className={"py-2 opacity-50 aria-selected:opacity-100 w-6 aria-disabled:opacity-10"}
          >
            <div className={layoutIconBox}> 
              <GiftIcon
              className={layoutIcons}
              style={{color:accent}}
              />
            Redeem           
            </div>  
         </Link>
         <Link 
          href={"/settings"} 
          aria-selected={path == "/settings" } 
          className={"py-2 opacity-50 aria-selected:opacity-100 w-6 aria-disabled:opacity-10"}
          >
            <div className={layoutIconBox}> 
              <Cog6ToothIcon
              className={layoutIcons}
              style={{color:accent}}
              />
            Settings           
            </div>  
         </Link>    
  </header>
  );
}

export const Layout = ( props: PropsWithChildren<{}> ) => {
  const dimensions = useScreenDimensions();
  const path = usePathname()
  const {vendorProgram: prog} = useAppSelector(state => state.vendorProgram)
  const {children} = props 
  const router = useRouter()

  // if no program is loaded, redirects to the landing page. 
  useEffect(() => { 
    if (!prog.address) router.push('/') 
  }, [, prog, router])
  
  return (
    <main 
      className='h-dvh w-full flex flex-col justify-center items-center overflow-hidden relative' 
      style={{backgroundColor: prog.colourBase}}
      > 

      {dimensions.width > 765  ? // = md  
        <NavbarTop path = {path} base = {prog.colourBase} accent = {prog.colourAccent} /> 
        :
        <NavbarBottom path = {path} base = {prog.colourBase} accent = {prog.colourAccent} /> 
      }

      <div className={`h-full w-full max-w-4xl flex flex-col justify-start ${dimensions.width > 765  ? 'pt-24' : 'pt-0'}`}> 
        {children}
      </div>

    </main>
  )


}

