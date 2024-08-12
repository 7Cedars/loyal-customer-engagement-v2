// NB! BEFORE going to production, ABIs need to be hard coded. This setup is for dev only.  

import { Abi } from "viem"
import factoryPrograms from "../../../../foundry/out/FactoryPrograms.sol/FactoryPrograms.json"
import loyaltyProgram from "../../../../foundry/out/LoyaltyProgram.sol/LoyaltyProgram.json"
import loyaltyGift from "../../../../foundry/out/LoyaltyGift.sol/LoyaltyGift.json"

export const factoryProgramsAbi: Abi = JSON.parse(JSON.stringify(factoryPrograms.abi)) 
export const loyaltyProgramAbi: Abi = JSON.parse(JSON.stringify(loyaltyProgram.abi)) // why?! why, why, why? It is NOT possible to directly import it. 
export const loyaltyGiftAbi: Abi  = JSON.parse(JSON.stringify(loyaltyGift.abi)) 
