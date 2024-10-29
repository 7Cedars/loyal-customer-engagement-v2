"use client"

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { Loader } from "./Loader";

type ButtonProps = {
  disabled?: boolean;
  children: any;
  onClick?: () => void;
};

const CustomButton = ({
  disabled = false,
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button 
      className={`w-full h-full grid grid-cols-1 disabled:opacity-50 text-center border content-center rounded-lg text-md p-2 h-12 border-gray-950`}  
      onClick={onClick} 
      disabled={disabled}
      >
      {children}
    </button>
  );
};

export default function Home() {
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();

  return (
    <main className="flex flex-col w-full h-dvh bg-slate-100 dark:bg-slate-900 place-content-center items-center">
      <div className={`h-fit grid grid-cols-1 justify-items-center max-w-lg max-w-3xl md:w-4/5`}>
        <div className={`w-full min-h-[50vh] grid grid-cols-1 content-between place-items-center max-w-lg gap-4 p-2`}>
          <div className="w-full self-center"> 
            <div className={`w-full grid grid-cols-1 text-3xl text-center pb-8`}> 
                hi there! this is loyal
            </div>  
            <div className="grid grid-cols-1 content-between place-items-center"> 
              <Image
                className="self-center rounded-t-lg text-center"
                width={80}
                height={80}
                src={"/logo.png"}
                alt="Logo"
              />
            </div>
            <div className={`w-full grid grid-cols-1 text-sm text-center pt-8 pb-6`}> 
              A lightweight modular dApp for customer engagement programs.   
            </div>
            <div className="w-full flex flex-col"> 
            { 
                user ? 
                  <div className="flex flex-col gap-4 items-center">
                    {` Connected to: ${
                        user.email ? user.email.address
                        : 
                        user.phone ? user.phone.number
                        :
                        user.wallet?.address 
                      }`
                    }
                    
                    <Loader /> 
                    
                    <CustomButton onClick={logout}> 
                      Disconnect
                    </CustomButton> 
                  </div> 
                : 
                <CustomButton onClick={login}> 
                  Connect
                </CustomButton> 
              }
          </div> 
        </div>
      </div>
    </div>
  </main> 
  )
}
