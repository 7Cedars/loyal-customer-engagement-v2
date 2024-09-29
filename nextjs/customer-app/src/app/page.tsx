"use client"

import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi";
import { setProgram } from "@/redux/reducers/programReducer";
import { setQrPoints } from "@/redux/reducers/qrPointsReducer";
import { Program, QrPoints } from "@/types";
import {  parseBigInt, parseHex, parseNumber, parseString } from "@/utils/parsers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReadContracts } from 'wagmi'

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
  const params = useSearchParams(); 
  const dispatch = useDispatch(); 
  const [prog, setProg] = useState<Program>(); 
  const router = useRouter()

  // Privy hooks
  // see docs: https://github.com/privy-io/wagmi-demo/blob/main/app/page.tsx 
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();
  const {wallets, ready: walletsReady} = useWallets();
  
  const qrData = useRef<QrPoints>({
    program: params.get('prg') ? parseHex(params.get('prg'))  : null,
    points: params.get('pts') ? parseBigInt(params.get('pts')) : null, // NUMBER?! 
    uniqueNumber: params.get('un') ? parseBigInt(params.get('un')) : null,  // NUMBER?! 
    signature: params.get('sig') ? parseHex(params.get('sig')) : null
  })
  console.log({qrData})

  const programContract = {
    address: qrData.current.program ? qrData.current.program  : '0x', 
    abi: loyaltyProgramAbi,
  } as const 

  console.log({programContract})
 
  const {data: programData, isFetched} = useReadContracts({
    contracts: [
      {
        ...programContract,
        functionName: 's_executed',
        args: [qrData.current.signature]
      },
      {
        ...programContract, 
        functionName: 'allowCreationCards'
      },
      {
        ...programContract, 
        functionName: 'name'
      },
      {
        ...programContract, 
        functionName: 'symbol'
      },
      {
        ...programContract, 
        functionName: 'imageUri'
      },
      {
      ...programContract, 
        functionName: 'CARD_FACTORY'
      },
      {
        ...programContract, 
        functionName: 'entryPoint'
      },
      {
        ...programContract, 
        functionName: 'LOYALTY_PROGRAM_VERSION'
      },
    ]
  })

  useEffect(() => {
    if (qrData.current && qrData.current.program != "0x" && isFetched && programData) {
      dispatch(setQrPoints(qrData.current)) 

      console.log("programData: ", programData)

      if (qrData.current.program) {
        const qrProgram: Program = { 
          address: qrData.current.program, 
          name: parseString(programData[2].result), 
          colourBase: parseString(programData[3].result).split(`;`)[0], 
          colourAccent: parseString(programData[3].result).split(`;`)[1], 
          uriImage: parseString(programData[4].result), 
          cardsFactory: parseHex(programData[5].result),
          entryPoint: parseHex(programData[6].result),
          version: parseString(programData[7].result)
        }
        setProg(qrProgram)
        dispatch(setProgram(qrProgram))
      }
      if (user) router.push('/home')
    } 
  }, [qrData, dispatch, isFetched, programData, user, router])

  console.log({
    params: params, 
    qrData: qrData, 
    data: programData
  })

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
            <div className="w-full grid grid-cols-1"> 
            { 
              isFetched ?
                prog && programData && !programData[0].result && qrData.current && !user ? 
                  <CustomButton onClick={login}>
                    This voucher is worth {qrData.current.points} points. Connect to claim your points.
                  </CustomButton>
                : 
                  prog && programData && programData[0].result && qrData.current && !user ? 
                  <CustomButton onClick={login}>
                    This voucher has expired. Log in to see your loyalty card. 
                  </CustomButton>
                : 
                  qrData.current.program != '0x' ? 
                  <CustomButton disabled>
                    The qrCode is invalid. Please try again with another Qrcode.
                  </CustomButton>
                : 
                  user ? 
                  <div className="flex flex-col gap-4 items-center">
                  <CustomButton onClick={logout}> 
                    Disconnect
                  </CustomButton> 
                  {` Connected to: ${
                      user.email ? user.email.address
                      : 
                      user.phone ? user.phone.number
                      :
                      user.wallet?.address 
                    }`
                  }
                  </div>
                : 
                  <CustomButton onClick={login}> 
                    Connect
                  </CustomButton> 
              :
              <CustomButton onClick={login} disabled> 
                Loading...
              </CustomButton> 
              }
          </div> 
        </div>
      </div>
    </div>
  </main> 
  )
}
