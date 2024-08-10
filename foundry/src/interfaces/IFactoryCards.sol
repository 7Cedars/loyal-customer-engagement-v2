// This is a near copy of SimpleAccountFactory.sol from ethinfinity (?) £check correct source. 
// See acknowledgements below. 

// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.26;

import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import {LoyaltyCard} from "../LoyaltyCard.sol";

/**
 * A simple factory contract for creating Loyalty Cards. 
 * A near copy of the standard SimpleAccountFactory, except that create cards register the program that created them. 
 * This enables cards to be restricted to only calling functions on their parent loyaltyProgram contract. 
 * -- original text: -- 
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
interface IFactoryCards {

    function getLoyaltyCard(address owner, address loyaltyProgram, uint256 salt) external returns (LoyaltyCard); 

}
