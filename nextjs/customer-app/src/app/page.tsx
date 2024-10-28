"use client"

import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi";
import { wagmiConfig } from "@/context/wagmiConfig";
import { resetVendor, setVendor } from "@/redux/reducers/vendorReducer";
import { setVoucher } from "@/redux/reducers/voucherReducer";
import { Program, QrPoints } from "@/types";
import {  parseBigInt, parseHex, parseNumber, parseString } from "@/utils/parsers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReadContracts } from 'wagmi'
import { readContracts } from "wagmi/actions";
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  const [savedPrograms, setSavedPrograms] = useState<Program[]>();  
  const router = useRouter()

  // Privy hooks
  // see docs: https://github.com/privy-io/wagmi-demo/blob/main/app/page.tsx 
  const {ready, user, authenticated, login, connectWallet, logout, linkWallet} = usePrivy();

  useEffect(()=>{
    if (!savedPrograms) {
      let localStore = localStorage.getItem("clp_c_programs")
      console.log({localStore})
      const saved: Program[] = localStore ? JSON.parse(localStore) : []
      setSavedPrograms(saved)
    }
  }, [savedPrograms])
  console.log({savedPrograms})
  
  const qrData = useRef<QrPoints>({
    program: params.get('prg') ? parseHex(params.get('prg'))  : null,
    points: params.get('pts') ? parseBigInt(params.get('pts')) : null,
    uniqueNumber: params.get('un') ? parseBigInt(params.get('un')) : null,
    signature: params.get('sig') ? parseHex(params.get('sig')) : null, 
    executed: false 
  })
  console.log({qrData})

  const getProgramData = useCallback(
    async() => {
      
      const programContract = {
        address: qrData.current.program ? qrData.current.program  : '0x', 
        abi: loyaltyProgramAbi,
      } as const 

      const temp = await readContracts(wagmiConfig, {
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
          }
        ]
      })

      if (!temp.find(item => {item.status != "success"}) && qrData.current.program) { // check if all items.status in the array of items are "success". 
        const qrProgram: Program = { 
          address: qrData.current.program, 
          name: parseString(temp[2].result), 
          colourBase: parseString(temp[3].result).split(`;`)[0], 
          colourAccent: parseString(temp[3].result).split(`;`)[1], 
          uriImage: parseString(temp[4].result), 
          cardsFactory: parseHex(temp[5].result),
          entryPoint: parseHex(temp[6].result)
        }
        setProg(qrProgram)
        dispatch(setVendor(qrProgram))
        dispatch(setVoucher({
          program: qrData.current.program as `0x${string}`,
          points: Number(qrData.current.points),
          uniqueNumber: Number(qrData.current.uniqueNumber),
          signature: qrData.current.signature as `0x${string}`
        }))

        const allPrograms = savedPrograms ? [qrProgram, ...savedPrograms] : [qrProgram]  
        localStorage.setItem("clp_c_programs", JSON.stringify(allPrograms)); 
        qrData.current.executed = temp[0].result as boolean
      }

    },[dispatch, savedPrograms]
  )

  const handleSelectionProgram = async (program: Program) => {
    setProg(program)
    dispatch(setVendor(program))
    router.push('/home')
  }

  useEffect(() => {
    if (qrData.current.program) getProgramData() 
  }, [, getProgramData])

  useEffect(() => {
    if (user && qrData.current.program && !qrData.current.executed) 
      router.push('/home')
  }, [, user, qrData.current])

  const handleRemoveProgram = (address: `0x${string}` | undefined) => {
    const filteredPrograms = savedPrograms?.filter((program) => program.address != address)
    setSavedPrograms(filteredPrograms)
    localStorage.setItem("clp_v_programs", JSON.stringify(filteredPrograms)); 
  }

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
                prog && qrData.current && !user ? 
                  <CustomButton onClick={login}>
                    This voucher is worth {qrData.current.points} points. Connect to claim your points.
                  </CustomButton>
                : 
                  prog && qrData.current && !user ?  // NEEDS TO READ s_executed! 
                  <CustomButton onClick={login}>
                    This voucher has expired. Log in to see your loyalty card. 
                  </CustomButton>
                : 
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
                  <CustomButton onClick={logout}> 
                    Disconnect
                  </CustomButton> 
                  { 
                  savedPrograms && savedPrograms.length > 0 ? 
                    savedPrograms.map((prog: Program, i) => 
                      <div 
                        key = {i} 
                        className={`relative w-full h-full flex flex-row text-md text-center border content-center rounded-lg p-2 mt-0 h-12`} 
                        style = {{
                          color: prog.colourAccent, 
                          borderColor: prog.colourAccent, 
                          backgroundColor: prog.colourBase
                        }} 
                        >
                        <button 
                          className="grow" 
                          onClick={() => handleSelectionProgram(prog)}>
                          {prog.name}
                        </button>
                        <div 
                          className="grid grid-cols-1 items-center absolute inset-y-0 right-0 hover:opacity-100 opacity-0">
                          <button onClick={() => handleRemoveProgram(prog.address)}>
                            <XMarkIcon
                              className={"h-6 w-6 mx-2"}
                              style={{color: prog.colourAccent}}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  : 
                  null 
                }
                  
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
