import { Gift, Status } from "@/types";
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'
import { useCallback, useEffect, useRef, useState } from "react";
import { loyaltyGiftAbi } from "@/context/abi";
import { Hex, Log } from "viem"
import { publicClient } from "@/context/clients";
import { whiteListedGifts } from "@/context/whitelistedGifts";

import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { parseBigIntToNumber, parseBoolean, parseEthAddress, parseMetadata, parseString, parseUri } from "@/utils/parsers";

export const useGifts = () => {
  const [ status, setStatus ] = useState<Status>("isIdle")
  const statusAtGetGiftsContractData = useRef<Status>("isIdle") 
  const statusAtMetadata = useRef<Status>("isIdle") 
  const [data, setData] = useState<Gift[] | undefined>() 
  const [gifts, setGifts] = useState<Gift[] | undefined>() 

  const getGiftsContractData = useCallback( async () => {
    statusAtGetGiftsContractData.current = "isLoading" 

    let giftAddress: Hex
    let giftContractData: Gift[] = []

    if (publicClient) { 
      try {
        for await (giftAddress of whiteListedGifts) {

          const giftContract = {
            address: giftAddress,
            abi: loyaltyGiftAbi,
          } as const

          const temp = await readContracts(wagmiConfig, {
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
                functionName: 'GIFT_COST', 
              }, 
              {
                ...giftContract, 
                functionName: 'i_uri', 
              }, 
              {
                ...giftContract, 
                functionName: 'HAS_ADDITIONAL_REQUIREMENTS', 
              }, 
            ], 
          })

            if (
              temp[0].status == "success" && 
              temp[1].status == "success" && 
              temp[2].status == "success" && 
              temp[3].status == "success" && 
              temp[4].status == "success"
            )
             
            giftContractData.push({
                address: parseEthAddress(giftAddress), 
                name: parseString(temp[0].result), 
                symbol: parseString(temp[1].result), 
                points: parseBigIntToNumber(temp[2].result), 
                uri: parseUri(temp[3].result), 
                additionalReq: parseBoolean(temp[4].result)
              })
        } 
        setData(giftContractData)
        statusAtGetGiftsContractData.current = "isSuccess"
      } catch (error) {
        statusAtGetGiftsContractData.current = "isError" 
      }
    } 

    statusAtGetGiftsContractData.current = "isSuccess"
  }, [ publicClient ])

  const getGiftsMetaData = async () => {
    statusAtMetadata.current = "isLoading"

    let gift: Gift
    let loyaltyGiftsMetadata: Gift[] = []

    if (data && publicClient) {
      try {
        for await (gift of data) {
          if (gift.uri) {
            const fetchedMetadata: unknown = await(
              await fetch(gift.uri)
              ).json()
              loyaltyGiftsMetadata.push({
                ...gift, 
                metadata: parseMetadata(fetchedMetadata)})
          }
        } 
        statusAtMetadata.current = "isSuccess"
        setData(loyaltyGiftsMetadata)
      } catch (error) {
        statusAtMetadata.current = "isError"
      }
    }
  }

  // initiates the loading of gifts at refresh. 
  useEffect(()=>{
    let localStore = localStorage.getItem("clp_v_gifts")
    const saved: Gift[] = localStore ? JSON.parse(localStore) : []
    setGifts(saved)
    setStatus("isSuccess")

    if (saved.length == 0) getGiftsContractData() 
  }, [ getGiftsContractData])

  // managing flow of data fetching and saving
  useEffect(() => {
    if ( 
      statusAtGetGiftsContractData.current == "isSuccess" && 
      statusAtMetadata.current == "isIdle" 
      ) { 
        getGiftsMetaData() 
    } 
    if ( 
      statusAtGetGiftsContractData.current == "isSuccess" && 
      statusAtMetadata.current == "isSuccess" 
      ) {
        setGifts(data)
        localStorage.setItem("clp_v_gifts", JSON.stringify(data)); 
        setStatus("isSuccess")
    }
  }, [ getGiftsMetaData ])

  useEffect(() => {
    if (
      statusAtGetGiftsContractData.current == "isLoading" ||
      statusAtMetadata.current == "isLoading"
      ) {
        setStatus("isLoading")
      }
  }, [ data ])

  return {status, gifts}
}