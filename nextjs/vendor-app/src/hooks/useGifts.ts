import { Gift, Status } from "@/types";
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'
import { useEffect, useRef, useState } from "react";
import { loyaltyGiftAbi } from "@/context/abi";
import { Log } from "viem"
import { useAccount, usePublicClient } from 'wagmi'

import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";

export const useLoyaltyGifts = () => {
  const publicClient = usePublicClient()
  const {chain} = useAccount()  
  const dispatch = useDispatch() 

  const [ status, setStatus ] = useState<Status>("isIdle")
  const statusAtgiftAddress = useRef<Status>("isIdle") 
  const statusAtUri = useRef<Status>("isIdle") 
  const statusAtMetadata = useRef<Status>("isIdle") 
  const statusAtGetAdditionalInfo = useRef<Status>("isIdle")
  const statusAtAvailableVouchers = useRef<Status>("isIdle") 
  const [data, setData] = useState<Gift[] | undefined>() 
  const [giftsRequested, setGiftsRequested] = useState<Gift[] | undefined>()
  const [loyaltyGifts, setLoyaltyGifts] = useState<Gift[] | undefined>() 

  const fetchGifts = (requestedGifts: Gift[] ) => {
    setStatus("isIdle")
    setData(undefined)
    setLoyaltyGifts(undefined)
  }

  const geGiftsContractData = async (requestedGifts: Gift[]) => {
    statusAtGetAdditionalInfo.current = "isLoading" 

    let gift: Gift
    let giftContractData: Gift[] = []

    if (publicClient) { 
      try {
        for await (gift of requestedGifts) {

          const giftContract = {
            address: gift.address,
            abi: loyaltyGiftAbi,
          } as const

          const data = await readContracts(wagmiConfig, {
            contracts: [
              {
                ...giftContract, 
                  functionName: 'name', 
              },
              {
                ...giftContract, 
                  functionName: 'symbol', 
              },
              {
                ...giftContract, 
                functionName: 'i_uri', 
              }, 
              {
                ...giftContract, 
                functionName: 'GIFT_COST()', 
              }, 
              {
                ...giftContract, 
                functionName: 'HAS_ADDITIONAL_REQUIREMENTS()', 
              }, 
            ], 
          })

          console.log("data @getAdditionalInfo: ", data)

            if (
              data[0].status == "success" && 
              data[1].status == "success" && 
              data[2].status == "success" && 
              data[3].status == "success"
            )

            // £CONTINUE HERE
             
            giftContractData.push({
                ...gift, 
                name: parseBigIntToNumber(data[0].result), 
                cost: parseBigIntToNumber(data[1].result), 
                hasAdditionalRequirements: parseBigIntToNumber(data[2].result), 
                isVoucher: parseBigIntToNumber(data[3].result)
              })
        } 
        statusAtGetAdditionalInfo.current = "isSuccess"
        setData(loyaltyGiftAdditionalInfo)
      } catch (error) {
        statusAtGetAdditionalInfo.current = "isError" 
        console.log(error)
      }
    } 

    statusAtGetAdditionalInfo.current = "isSuccess"
  }


  // const geGiftsContractData = async () => {
  //   statusAtUri.current = "isLoading"
    
  //   let item: LoyaltyGift
  //   let loyaltyGiftsUris: LoyaltyGift[] = []

  //   if (data && publicClient) { 
  //     try {
  //       for await (item of data) {
  //         const uri: unknown = await publicClient.readContract({ 
  //           address: item.giftAddress, 
  //           abi: loyaltyGiftAbi,
  //           functionName: 'uri',
  //           args: [item.giftId]
  //         })
  //         const genericUri = parseUri(uri); 
  //         const specificUri = genericUri.replace("{id}", `000000000000000000000000000000000000000000000000000000000000000${item.giftId}.json`)
  //         loyaltyGiftsUris.push({...item, uri: specificUri})
  //       }
  //       statusAtUri.current = "isSuccess"
  //       setData(loyaltyGiftsUris)
  //     } catch (error) {
  //       statusAtUri.current = "isError"
  //       console.log(error)
  //     }
  //   }
  // }

  const getGiftsMetaData = async () => {
    statusAtMetadata.current = "isLoading"

    let item: LoyaltyGift
    let loyaltyGiftsMetadata: LoyaltyGift[] = []

    if (data && publicClient) {
      try {
        for await (item of data) {
          if (item.uri) {
            const fetchedMetadata: unknown = await(
              await fetch(item.uri)
              ).json()
              loyaltyGiftsMetadata.push({...item, metadata: parseMetadata(fetchedMetadata)})
          }
        } 
        statusAtMetadata.current = "isSuccess"
        setData(loyaltyGiftsMetadata)
      } catch (error) {
        statusAtMetadata.current = "isError"
        console.log(error)
      }
    }
  } 

  
  
  // should be a separate function
  
  // const getAvailableGifts = async () => {
  //   statusAtAvailableVouchers.current = "isLoading" 

  //   let item: LoyaltyGift
  //   let loyaltyGiftsAvailableVouchers: LoyaltyGift[] = []

  //   if (data && selectedLoyaltyProgram && selectedLoyaltyProgram.programAddress && publicClient) { 
  //     try {
  //       for await (item of data) {
  //           const availableVouchers: unknown = await publicClient.readContract({
  //             address: item.giftAddress, 
  //             abi: loyaltyGiftAbi,
  //             functionName: 'balanceOf', 
  //             args: [parseEthAddress(selectedLoyaltyProgram?.programOwner), item.giftId]
  //           })

  //           loyaltyGiftsAvailableVouchers.push({...item, availableVouchers: Number(parseBigInt(availableVouchers))})
  //       } 
  //       statusAtAvailableVouchers.current = "isSuccess"
        
  //       // resetting redux.
  //       setData(loyaltyGiftsAvailableVouchers)
  //     } catch (error) {
  //       statusAtAvailableVouchers.current = "isError" 
  //       console.log(error)
  //     }
  //   } 
  // }

  useEffect(() => {
    if ( 
      data && 
      statusAtgiftAddress.current == "isSuccess" && 
      statusAtUri.current == "isIdle" 
      ) { 
        getLoyaltyGiftsUris() 
    } 
    if ( 
      data && 
      statusAtUri.current == "isSuccess" && 
      statusAtMetadata.current == "isIdle" 
      ) {
        getLoyaltyGiftsMetaData() 
    }
    if ( 
      data && 
      statusAtMetadata.current == "isSuccess" && 
      statusAtGetAdditionalInfo.current == "isIdle"
      ) {
        getAdditionalInfo() 
    } 
    if ( 
      data && 
      statusAtGetAdditionalInfo.current == "isSuccess" && 
      statusAtAvailableVouchers.current == "isIdle"
      ) {
        getAvailableVouchers() 
    } 
  }, [ data  ])

  useEffect(() => {
    if (
      statusAtgiftAddress.current == "isSuccess" && 
      statusAtUri.current == "isSuccess" && 
      statusAtMetadata.current == "isSuccess" && 
      statusAtAvailableVouchers.current == "isSuccess" 
      ) {
        setStatus("isSuccess")
        if (data) dispatch(saveLoyaltyGifts(data)) 
        setLoyaltyGifts(data)
      }

    if (
      statusAtgiftAddress.current == "isLoading" ||
      statusAtUri.current == "isLoading" || 
      statusAtMetadata.current == "isLoading" || 
      statusAtAvailableVouchers.current == "isLoading" 
      ) {
        setStatus("isLoading")
      }
  }, [ data ])

  return {status, loyaltyGifts, fetchGifts, updateAvailableVouchers}
}

function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
