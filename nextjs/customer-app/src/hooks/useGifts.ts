import { Gift, Status } from "@/types";
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../context/wagmiConfig'
import { useCallback, useEffect, useRef, useState } from "react";
import { loyaltyGiftAbi, loyaltyProgramAbi } from "@/context/abi";
import { Hex, Log } from "viem"
import { whiteListedGifts } from '../context/whitelistedGifts';
import { publicClient } from '../context/clients'

import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { parseBigIntToNumber, parseBoolean, parseEthAddress, parseMetadata, parseString, parseUri } from "@/utils/parsers";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { setProgram } from "@/redux/reducers/programReducer";

export const useGifts = () => {
  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const [status, setStatus ] = useState<Status>("isIdle")
  const [error, setError] = useState<any | null>(null)
  const [gifts, setGifts] = useState<Gift[] | undefined>() 
  const dispatch = useDispatch() 

  const getGiftsContractData = useCallback( 
    async (requestedGifts: `0x${string}`[]) => {

    let giftAddress: Hex
    let giftContractData: Gift[] = []

    if (publicClient) { 
      try {
        for await (giftAddress of requestedGifts) {

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

          if (!temp.find(item => {item.status != "success"})) // check if all items.status in the array of items are "success". 
            
          giftContractData.push({
              address: parseEthAddress(giftAddress), 
              name: parseString(temp[0].result), 
              symbol: parseString(temp[1].result), 
              points: parseBigIntToNumber(temp[2].result), 
              uri: parseUri(temp[3].result), 
              additionalReq: parseBoolean(temp[4].result)
            })
        } 
        return giftContractData
      } catch (error) {
        setStatus("isError") 
        setError(error)
      }
    } 
  }, [ ])

  const getGiftsMetaData = async (gifts: Gift[]) => {
    let gift: Gift
    let loyaltyGiftsMetadata: Gift[] = []

    if (publicClient) {
      try {
        for await (gift of gifts) {
          if (gift.uri) {
            const fetchedMetadata: unknown = await(
              await fetch(gift.uri)
              ).json()
              loyaltyGiftsMetadata.push({
                ...gift, 
                metadata: parseMetadata(fetchedMetadata)})
          }
        } 
        return loyaltyGiftsMetadata
      } catch (error) {
        setStatus("isError") 
        setError(error)
      }
    }
  }

  const fetchGifts = useCallback(
    async () => {
      setStatus("isLoading")

      if (prog.address) {
        const allowedGifts = await readContract(wagmiConfig, {
          abi: loyaltyProgramAbi,
          address: prog.address,
          functionName: 'getAllowedGifts'
        })

        const savedGifts = prog.gifts ? prog.gifts.map(gift => gift.address) : []

        if (JSON.stringify(savedGifts)==JSON.stringify(allowedGifts)) {
          console.log("gifts already saved.")
          setGifts(prog.gifts)
          setStatus("isSuccess")
        } else {
          const giftContractData = await getGiftsContractData(allowedGifts as `0x${string}`[])
          const giftContractwithMetadata = giftContractData ? await getGiftsMetaData(giftContractData) : []
  
          setGifts(giftContractwithMetadata)
          dispatch(setProgram({
            ...prog, 
            gifts: giftContractwithMetadata
          }))
          setStatus("isSuccess")
        }   
      }
    }, [getGiftsContractData, dispatch, prog])

  return {status, error, gifts, fetchGifts}
}