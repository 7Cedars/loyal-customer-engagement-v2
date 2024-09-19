"use client"; 

import { Layout } from "@/components/Layout";
import { Button } from "@/components/Button";
import { TitleText } from "@/components/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";
import { useBalance } from 'wagmi'
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from "react";
import { setBalanceProgram } from "@/redux/reducers/programReducer";
import { useDispatch } from "react-redux";
import { QrScanner } from "./QrScanner";
// import { bundlerClient, publicClient } from "@/context/clients";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { privateKeyToAccount } from "viem/accounts";
import {Client, createClient, createWalletClient, custom, encodeFunctionData, http, numberToBytes, numberToHex} from 'viem';
import { parseEthAddress } from "@/utils/parsers";
import { foundry } from "viem/chains";
import {bundlerActions, createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, walletClientToSmartAccountSigner} from "permissionless"; 
import {signerToSimpleSmartAccount, SimpleSmartAccount, SmartAccount} from "permissionless/accounts";
import { setAbstractAccount } from "@/redux/reducers/abstractAccountReducer";
import { useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { useLoyaltyCard } from "@/hooks/useLoyaltyCard";
// import { bundlerClient } from '../../context/clients' 
import { createBundlerClient, SmartAccountImplementation } from 'viem/account-abstraction'
import { loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi";
import { publicClient } from "@/context/clients";
import { toLoyaltyCardAccount } from "@/utils/toLoyaltyCardAccount";
import { getBlock, sendTransaction, simulateContract, writeContract } from 'viem/actions'

export default function Page() {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const randomNonce  = useRef<bigint>(BigInt(Math.round(Math.random() * 10 ** 18)))
  const {qrPoints} = useAppSelector(state => state.qrPoints)
  const [mode, setMode]  = useState()
  const [transferMode, setTransferMode] = useState(false)
  const {data: balanceData, refetch, fetchStatus} = useBalance({ address: prog.address })
  const {wallets, ready: walletsReady} = useWallets();
  const dispatch = useDispatch() 
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
  const {loyaltyCard, error, isLoading, fetchLoyaltyCard, sendUserOp} = useLoyaltyCard(); 

  // const [signature, setSignature] = useState<`0x${string}`>(); 

  useEffect(() => {
    if (prog.address) {
      fetchLoyaltyCard(prog.address, numberToHex(123456, {size: 32}))
    }
  }, [prog.address, fetchLoyaltyCard])

  // step 1: check for qrData in redux 
  // step 2: writeContract: redeemPoints. 
  // step 3: check event. if success: show info box. 

  // updating balance of program. 
  useEffect(() => {
    if (
      balanceData && 
      balanceData.decimals && 
      Number(balanceData?.value) / 10 ** balanceData?.decimals != prog.balance) 
      {
        dispatch(setBalanceProgram(Number(balanceData?.value) / 10 ** balanceData?.decimals))  
      }
  }, [balanceData, prog, dispatch])
  
  return (
    <Layout> 
      <TitleText title = {prog.name ? prog.name : "Home"} size = {2} /> 
      <div className="grow flex flex-col justify-start items-center">
        <div className="w-full sm:w-4/5 lg:w-1/2 h-12 p-2">
        {/* The following is just for dev purposes...  */}
          <Button onClick={() => {
            if (loyaltyCard) 
              sendUserOp(
                loyaltyCard, 
                'requestPoints', 
                [
                  qrPoints.program, 
                  qrPoints.points, 
                  qrPoints.uniqueNumber, 
                  qrPoints.signature,
                  embeddedWallet?.address ? embeddedWallet.address : '0x' 
                ], 
                numberToHex(123456, {size: 32})
              )
        }}> 
            Here should be points on card
          </Button>
        </div>
        <section 
          className="h-full w-full flex flex-col justify-start items-center mb-16 md:mb-0">
          
          <div 
            className="grow-0 opacity-0 aria-selected:grow aria-selected:opacity-100 transition:all ease-in-out duration-300 delay-300 h-2"
            aria-selected={mode == undefined} 
            >
            <div className="w-full h-full grid grid-cols-1 content-center "> 
              <div
                className={`w-full grid grid-cols-1 text-3xl text-center p-4`}
                style={{color: prog.colourAccent}}
                > 
                hi there! this is loyal
              </div>  
              <div 
                className={`w-full grid grid-cols-1 text-sm text-center`}
                style={{color: prog.colourAccent}}
                > 
                A lightweight, composable, app for customer engagement programs.   
              </div> 
            </div> 
          </div>

          {/* Top bar, always visible */}
          <section 
            className="z-10 h-12 flex flex-row justify-between items-center w-full border rounded-t-full"
            style = {{borderColor: prog.colourAccent, borderBottom: prog.colourBase}}
            >
               <button onClick={() => {}} > 
                  <div 
                  className="ms-8 h-8 w-8 rotate-180 aria-selected:rotate-0 transition:all ease-in-out duration-300 delay-300"
                  aria-selected={mode == undefined} 
                  > 
                  <ChevronUpIcon
                    className={""}
                    style={{color:prog.colourAccent}}
                  />
                  </div> 
                </button>     
              <div className="max-w-7xl w-1/2">
                Scan Qr Code
              </div>
              {/* empty box to help with outline */}
              <div className="me-8 h-8 w-8" >  
            </div>
          </section>

          <div 
            className="flex flex-col grow-0 w-full opacity-0 aria-selected:opacity-100 aria-selected:grow transition:all ease-in-out duration-300 delay-300 h-2 border-x"
            aria-selected={mode != undefined} 
            style={{borderColor: prog.colourAccent}}
          > 
            <QrScanner /> 
          </div> 
        </section>
      </div>
    </Layout>
  )
}