"use client"

import { Button } from "@/components/Button";
import { factoryProgramsAbi, loyaltyProgramAbi } from "@/context/abi";
import { setProgram } from "@/redux/reducers/programReducer";
import { setQrPoints } from "@/redux/reducers/qrPointsReducer";
import { Program, QrPoints } from "@/types";
import { parseBigInt, parseHex, parseNumber, parseString } from "@/utils/parsers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Hex, hexToBytes, stringToHex } from "viem";
import { useReadContracts } from 'wagmi'

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
    program: params.get('prg') ? parseHex(params.get('prg'))  :'0x',
    points: params.get('pts') ? parseBigInt(params.get('pts')) : 0n,
    uniqueNumber: params.get('un') ? parseBigInt(params.get('un')) : 0n,
    signature: params.get('sig') ? parseHex(params.get('sig')) : '0x'
  })

  const programContract = {
    address: qrData.current.program, 
    abi: loyaltyProgramAbi,
  } as const 
 
  const {data: programData, isFetched} = useReadContracts({
    contracts: [
      {
        ...programContract,
        functionName: 's_executed',
        args: [qrData.current.signature]
      },
      {
        ...programContract, 
        functionName: 's_allowCreationCards'
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
        functionName: 's_imageUri'
      },
      {
      ...programContract, 
        functionName: 's_cardFactory'
      },
      {
        ...programContract, 
        functionName: 's_entryPoint'
      },

    ]
  })

  useEffect(() => {
    if (qrData.current && isFetched && programData) {
      dispatch(setQrPoints(qrData.current)) 

      const qrProgram: Program = { 
        address: qrData.current.program, 
        name: parseString(programData[2].result), 
        colourBase: parseString(programData[3].result).split(`;`)[0], 
        colourAccent: parseString(programData[3].result).split(`;`)[1], 
        uriImage: parseString(programData[4].result), 
        cardsFactory: parseHex(programData[5].result),
        entryPoint: parseHex(programData[6].result)
      }
      setProg(qrProgram)
      dispatch(setProgram(qrProgram))

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
              prog && programData && !programData[0].result && qrData.current && !user ? 
                <Button onClick={login}>
                  This voucher is worth {qrData.current.points} points. Connect to claim your points.
                </Button>
              : 
                prog && programData && programData[0].result && qrData.current && !user ? 
                <Button onClick={login}>
                  This voucher has expired. Log in to see your loyalty card. 
                </Button>
              : 
                qrData.current.program != undefined ? 
                <Button disabled>
                  The qrCode is invalid. Please try again with another Qrcode.
                </Button>
              : 
                user ? 
                <Button onClick={logout}> 
                  {` Connected to: ${
                    user.email ? user.email.address
                    : 
                    user.phone ? user.phone.number
                    :
                    user.wallet?.address 
                  }`
                }
                </Button> 
              : 
                <Button onClick={login}> 
                  Connect
                </Button> 
              }
          </div> 
        </div>
      </div>
    </div>
  </main> 
  )
}
