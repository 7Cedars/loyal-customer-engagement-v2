import { Gift, Status } from "@/types";
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'
import { useCallback, useState } from "react";
import { loyaltyGiftAbi} from "@/context/abi";
import { publicClient } from '../context/clients'
import { useAppSelector } from "@/redux/hooks";
import { parseBigIntToNumber, parseBoolean, parseEthAddress, parseMetadata, parseString, parseUri } from "@/utils/parsers";

export const useGift = () => {
  const [status, setStatus ] = useState<Status>("idle")
  const [error, setError] = useState<any | null>(null)
  const [gift, setGift] = useState<Gift | undefined>() 

  const getGiftContractData = useCallback( 
    async (requestedGift: `0x${string}`) => {
    let giftContractData: Gift; 

    if (publicClient) { 
      try {
          const giftContract = {
            address: requestedGift,
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

          if (!temp.find(item => {item.status != "success"})) { // check if all items.status in the array of items are "success". 
            
          giftContractData = {
              address: parseEthAddress(requestedGift), 
              name: parseString(temp[0].result), 
              symbol: parseString(temp[1].result), 
              points: parseBigIntToNumber(temp[2].result), 
              uri: parseUri(temp[3].result), 
              additionalReq: parseBoolean(temp[4].result)
            }
          return giftContractData
          }
      } catch (error) {
        setStatus("error") 
        setError(error)
      }
    } 
  }, [ ])

  const getGiftsMetaData = async (gift: Gift) => {
    let loyaltyGiftsMetadata: Gift 

    if (publicClient) {
      try {
          if (gift.uri) {
            const fetchedMetadata: unknown = await(
              await fetch(gift.uri)
              ).json()
            
              loyaltyGiftsMetadata = {
                ...gift, 
                metadata: parseMetadata(fetchedMetadata)}
              
              return loyaltyGiftsMetadata
          }
      } catch (error) {
        setStatus("error") 
        setError(error)
      }
    }
  }

  const fetchGift = useCallback(
    async (requestedGift: `0x${string}`) => {
      setStatus("loading")

      const giftContractData = await getGiftContractData(requestedGift)
      const giftContractwithMetadata = giftContractData ? await getGiftsMetaData(giftContractData) : undefined
  
      setGift(giftContractwithMetadata)   
      setStatus("success")

    }, [getGiftContractData])

  return {status, error, gift, fetchGift}
}