// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {LoyaltyGift} from "../LoyaltyGift.sol";
import {LoyaltyProgram} from "../LoyaltyProgram.sol";
import {LoyaltyCard} from "../LoyaltyCard.sol";
import {BokkyPooBahsDateTimeLibrary} from "lib/BokkyPooBahsDateTimeLibrary/contracts/BokkyPooBahsDateTimeLibrary.sol";

contract FridayFifteen is LoyaltyGift {
  uint256 public constant GIFT_COST = 3000; 
  bool public constant HAS_ADDITIONAL_REQUIREMENTS = false; 
  
  constructor() 
    LoyaltyGift(
      "Friday Fifteen Percent Off!", 
      "LPX", 
      "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmcbmQKjEFUVrUCwY5hF1bVYb4f2Cb1UTRUXZuYFn7VjiW"
    ) {}

  function requirementsExchangeMet(address payable _card) external override returns (bool) {
    address payable loyaltyProgram = LoyaltyCard(_card).s_loyaltyProgram(); 
    uint256 balance = LoyaltyProgram(loyaltyProgram).balanceOf(_card);
    if (balance < GIFT_COST) {
         revert ("Not enough points.");
    }
    return true;
  }

  function requirementsRedeemMet(address payable _card) external override returns (bool) { 
    // check if its friday. £note: depends on simple reading of block.timestamp. 
    if (BokkyPooBahsDateTimeLibrary.getDayOfWeek(block.timestamp) != 5 ) {
            revert("It's not Friday!");
        } 
    return true; 
  }
}