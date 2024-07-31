"use client";

import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useAppSelector } from '@/redux/hooks';
import { GiftIcon, HomeIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';
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
  return (
    <header className="absolute w-screen top-0 z-10 flex flex-row justify-around h-18 text-sm px-6 pt-2">
      <Link 
        href='/about' 
        aria-selected={path == `/about`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        About
      </Link>
      
      <Link 
        href='/home' 
        aria-selected={path == `/home`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        Home 
      </Link>

      <Link 
        href='/gifts' 
        aria-selected={path == `/gifts`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        Gifts
      </Link>

      <Link 
        href='/transactions' 
        aria-selected={path == `/transactions`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        Transaction 
      </Link>
      
      <Link 
        href='/settings' 
        aria-selected={path == `/settings`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        Settings 
      </Link>

      <Link 
        href='/' 
        aria-selected={path == `/`}
        className={"p-3 px-6"}
        style={{color:accent}}
        >
        Exit 
      </Link>
    </header>
    );
  }

  const NavbarBottom = ({path, base, accent}: NavbarProps) => {
      const layoutIconBox: string = 'col-span-1 grid text-xs justify-items-center'
      const layoutIcons: string = 'h-7 w-7'
    
      return (
        <header 
          className="absolute bottom-0 z-10 flex justify-between h-16 w-full text-sm px-4"
          style={{color:accent}}
          >
        <Link 
          href={"/home"}
          aria-selected={path == "/home"}
          className={"p-3 px-6"}
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
          href={"/gifts"} 
          aria-selected={path == "/gifts" } 
          className={"p-3 px-6"}
          >
            <div className={layoutIconBox}> 
              <GiftIcon
              className={layoutIcons}
              style={{color:accent}}
              />
            Claim           
            </div>  
         </Link>
         <Link 
          href={"/transactions"} 
          aria-selected={path == "/transactions" } 
          className={"p-3 px-6"}
          >
            <div className={layoutIconBox}> 
              <SquaresPlusIcon
              className={layoutIcons}
              style={{color:accent}}
              />
            Transactions           
            </div>  
         </Link>
         <Link 
          href={"/settings"} 
          aria-selected={path == "/settings" } 
          className={"p-3 px-6"}
          >
            <div className={layoutIconBox}> 
              <SquaresPlusIcon
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
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
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

      {dimensions.width > 896  ? 
        <NavbarTop path = {path} base = {prog.colourBase} accent = {prog.colourAccent} /> 
        :
        <NavbarBottom path = {path} base = {prog.colourBase} accent = {prog.colourAccent} /> 
      }

      <div className='h-full w-full max-w-4xl flex flex-col justify-start pt-12 border border-green-500'> 
        {children}
      </div>

    </main>
  )


}

