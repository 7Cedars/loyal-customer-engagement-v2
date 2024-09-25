import { Gift, GiftsInBlocks, Status } from "@/types";
import { readContracts } from '@wagmi/core'
import { wagmiConfig } from '../../wagmi-config'
import { useCallback, useEffect, useState } from "react";
import { loyaltyGiftAbi } from "@/context/abi";
import { Log, decodeEventLog } from "viem"
import { publicClient } from "@/context/clients";
import { parseBigIntToNumber, parseBoolean, parseEthAddress, parseMetadata, parseString, parseUri } from "@/utils/parsers";

type GiftDeployedEvent = {
  args: {
    giftAddress: `0x${string}`
  }
  eventName: "LoyaltyGiftDeployed"
}

export const useGifts = () => {
  const [status, setStatus] = useState<Status>("isIdle")
  const [error, setError] = useState<any | null>(null)
  const [fetchedGifts, setFetchedGifts] = useState<GiftsInBlocks | undefined>() // latest fetched gifts
  const [allGifts, setAllGifts] = useState<GiftsInBlocks[]>() // all gifts ever fetched. nested array, sorted by block value. 

  // at every refresh, the latest data from local store is loaded.  
  useEffect(() => {
    let localStore = localStorage.getItem("clp_v_gifts")
    const saved: GiftsInBlocks[] = localStore ? JSON.parse(localStore) : [{
      startBlock: 0, 
      endBlock: 1,
      gifts: []
    }]
    setAllGifts(saved)
  }, [])

  const getGiftsContractData = useCallback( 
    async (requestedGifts: `0x${string}`[]) => {

      let giftAddress: `0x${string}`
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

              if (
                !temp.find(item => {item.status != "success"})
                // temp[0].status == "success" && 
                // temp[1].status == "success" && 
                // temp[2].status == "success" && 
                // temp[3].status == "success" && 
                // temp[4].status == "success"
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
    async (startBlock: number, endBlock: number) => {
      setStatus("isLoading")

      // loading gifts saved in localStorage. 
      // let localStore = localStorage.getItem("clp_v_gifts")
      const saved: GiftsInBlocks[] = allGifts ? allGifts : []
      // setAllGifts(saved)

      // check if blocks have already been queried. 
      const alreadyChecked = saved.find(block => {
        return block.startBlock <= endBlock && startBlock <= block.endBlock 
      })
      if (alreadyChecked) {
        setStatus("isError")
        setError("requested blocks already queried") 
        return;  
      }
      
      // if checks pass: 
      // fetch events
      const logs: Log[] = await publicClient.getContractEvents({
        abi: loyaltyGiftAbi, 
        eventName: 'LoyaltyGiftDeployed',  
        fromBlock: BigInt(startBlock),
        toBlock: BigInt(endBlock) 
      }) 
      // decode the events
      const events = logs.map((log: Log) => {
        return decodeEventLog({
          abi: loyaltyGiftAbi,
          topics: log.topics 
        })
      })
      
      // retrieve addresses and call subsequent data fetching functions. 
      const giftEvents = events as unknown as GiftDeployedEvent[]
      const requestedGifts = giftEvents.map(event => event.args.giftAddress)
      const giftContractData = await getGiftsContractData(requestedGifts)

      const giftContractwithMetadata = giftContractData ? await getGiftsMetaData(giftContractData) : []
      const giftsInBlocks: GiftsInBlocks = {
        startBlock, 
        endBlock, 
        gifts: giftContractwithMetadata as Gift[]
      }
      const gifts = [...saved, giftsInBlocks] 

      // sort queries by block number.  
      gifts.sort((a, b) => {
        return a.startBlock > b.startBlock ? -1 : 1 // the latest block, with the largest block number, should end up first in line. 
      })

      // store all items. 
      setFetchedGifts(giftsInBlocks)
      setAllGifts(gifts)
      localStorage.setItem("clp_v_gifts", JSON.stringify(gifts));
      setStatus("isSuccess")

    }, [getGiftsContractData]
  ) 

  return {fetchGifts, fetchedGifts, allGifts, status, error}
}