// NB! BEFORE going to production, ABIs need to be hard coded. This setup is for dev only.  

import { Abi } from "viem"
import entryPoint from "../../../../foundry/out/EntryPoint.sol/EntryPoint.json"
import factoryPrograms from "../../../../foundry/out/FactoryPrograms.sol/FactoryPrograms.json"
import factoryCards from "../../../../foundry/out/FactoryCards.sol/FactoryCards.json"
import loyaltyProgram from "../../../../foundry/out/LoyaltyProgram.sol/LoyaltyProgram.json"
import loyaltyCard from "../../../../foundry/out/LoyaltyCard.sol/LoyaltyCard.json"
import loyaltyGift from "../../../../foundry/out/LoyaltyGift.sol/LoyaltyGift.json"

export const entryPointAbi: Abi = JSON.parse(JSON.stringify(entryPoint.abi)) 
export const factoryProgramsAbi: Abi = JSON.parse(JSON.stringify(factoryPrograms.abi)) 
export const factoryCardsAbi: Abi = JSON.parse(JSON.stringify(factoryCards.abi)) 
export const loyaltyProgramAbi: Abi = JSON.parse(JSON.stringify(loyaltyProgram.abi)) // why?! why, why, why? It is NOT possible to directly import it. 
export const loyaltyCardAbi: Abi  = JSON.parse(JSON.stringify(loyaltyCard.abi)) 
export const loyaltyGiftAbi: Abi  = JSON.parse(JSON.stringify(loyaltyGift.abi)) 
