"use client"

import { loyaltyProgramAbi } from "@/context/abi";
import { setQrPoints } from "@/redux/reducers/qrPointsReducer";
import { parseHex, parseNumber } from "@/utils/parsers";
import Image from "next/image";
import { 
  usePathname, 
  useRouter, 
  useSearchParams 
} from 'next/navigation';
import { useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { hexToBytes } from "viem";
import { useReadContracts } from 'wagmi'

// to do: 
// 1: read URL. CHECK
// 2: write data to redux store CHECK  
// 3: read loyalty program contract 
// 4: build info box
// 5: build privy login. 

export default function Home() {
  const params = useSearchParams(); 
  const dispatch = useDispatch(); 

  const qrData = useRef({
    program: parseHex(params.get('prg')),
    points: parseNumber(Number(params.get('pts'))),
    uniqueNumber: parseNumber(Number(params.get('un'))),
    signature: parseHex(params.get('sig'))
  })

  const programData = useReadContracts({
    contracts: [
      {
        ...loyaltyProgramAbi,
        functionName: 's_executed',
        args: [hexToBytes(qrData.current.signature)]
      },
      {
        ...loyaltyProgramAbi,
        functionName: 's_allowCreationCards'
      },
    ]
  })

  console.log("programData: ", programData)

  useEffect(() => {
    if (qrData.current) dispatch(setQrPoints(qrData.current)) 
  }, [qrData, dispatch])

  console.log({
    params: params, 
    qrData: qrData
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
            <div className={`w-full grid grid-cols-1 text-sm text-center pt-8`}> 
              A lightweight modular dApp for customer engagement programs.   
            </div> 
          </div> 
        </div>
    </div>
  </main> 
  )
}
