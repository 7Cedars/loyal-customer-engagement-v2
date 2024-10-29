'use client'

import { Button } from '@/components/Button';
import { loyaltyProgramAbi } from '@/context/abi';
import { wagmiConfig } from '@/context/wagmiConfig';
import { setVendor } from '@/redux/reducers/vendorReducer';
import { setVoucher } from '@/redux/reducers/voucherReducer';
import { Program, QrPoints } from '@/types';
import { parseBigInt, parseHex, parseString } from '@/utils/parsers';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { readContracts } from 'wagmi/actions';
import { XMarkIcon} from '@heroicons/react/24/outline';

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

const LoadVoucher = () => {
  const params = useSearchParams(); 
  const dispatch = useDispatch(); 
  const router = useRouter()
  const [savedPrograms, setSavedPrograms] = useState<Program[]>();  
  
  useEffect(()=>{
    if (!savedPrograms) {
      let localStore = localStorage.getItem("clp_c_programs")
      console.log({localStore})
      const saved: Program[] = localStore ? JSON.parse(localStore) : []
      setSavedPrograms(saved)
    }
  }, [savedPrograms])

  const qrRaw = useRef<QrPoints>({
    program: params.get('prg') ? parseHex(params.get('prg'))  : undefined,
    points: params.get('pts') ? parseBigInt(params.get('pts')) : undefined,
    uniqueNumber: params.get('un') ? parseBigInt(params.get('un')) : undefined,
    signature: params.get('sig') ? parseHex(params.get('sig')) : undefined, 
    executed: false 
  })
  console.log({qrRaw})

  const handleSelectionProgram = async (program: Program) => {
    dispatch(setVendor(program))
    router.push('/home')
  }

  const handleRemoveProgram = (address: `0x${string}` | undefined) => {
    const filteredPrograms = savedPrograms?.filter((program) => program.address != address)
    setSavedPrograms(filteredPrograms)
    localStorage.setItem("clp_v_programs", JSON.stringify(filteredPrograms)); 
  }

  const handleLoadVoucher = () => {
    loadProgData() 
    router.push('/home')
  }

  const loadProgData = useCallback(
      async() => {
        const programContract = {
          address: qrRaw.current.program ? qrRaw.current.program  : '0x', 
          abi: loyaltyProgramAbi,
        } as const 
  
        const temp = await readContracts(wagmiConfig, {
          contracts: [
            {
              ...programContract,
              functionName: 's_executed',
              args: [qrRaw.current.signature]
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
  
        if (!temp.find(item => {item.status != "success"})) { // check if all items.status in the array of items are "success". 
          const qrProgram: Program = { 
            address: qrRaw.current.program == null ? undefined : qrRaw.current.program , 
            name: parseString(temp[2].result), 
            colourBase: parseString(temp[3].result).split(`;`)[0], 
            colourAccent: parseString(temp[3].result).split(`;`)[1], 
            uriImage: parseString(temp[4].result), 
            cardsFactory: parseHex(temp[5].result),
            entryPoint: parseHex(temp[6].result)
          }
          dispatch(setVendor(qrProgram))
          dispatch(setVoucher({
            program: qrRaw.current.program as `0x${string}`,
            points: Number(qrRaw.current.points),
            uniqueNumber: Number(qrRaw.current.uniqueNumber),
            signature: qrRaw.current.signature as `0x${string}`
          }))

          // check if program has not been saved in local storage. If so, add to local storage. 
          if (savedPrograms && savedPrograms.find(program => program.address == qrRaw.current.program) == undefined) {
            const allPrograms = savedPrograms ? [qrProgram, ...savedPrograms] : [qrProgram]  
            localStorage.setItem("clp_c_programs", JSON.stringify(allPrograms)); 
          }
          // reset qrRaw data. 
          qrRaw.current.program = '0x0' 
        }
      },[dispatch, savedPrograms]
    )

    console.log( "qrRaw.current: ",  qrRaw.current)

  return (
    <>
    { 
      qrRaw.current.program != '0x0' && qrRaw.current.program != undefined ? 
      <CustomButton onClick={()=> {handleLoadVoucher()}} >
        Load Voucher
      </CustomButton>
      :
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
    </>
  )
}

const FallbackLoadVoucher = () => {
  return (
    <Button statusButton='pending'>
      Loading Voucher...
    </Button>
  )
}

export const Loader = () => {
  return (
  <Suspense fallback = {< FallbackLoadVoucher /> }>
    <LoadVoucher />
  </Suspense>
  )
}  