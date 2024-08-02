// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {LoyaltyGift} from "../LoyaltyGift.sol";
import {LoyaltyProgram} from "../LoyaltyProgram.sol";
import {LoyaltyCard} from "../LoyaltyCard.sol";

contract FreeCoffee is LoyaltyGift {
  uint256 public constant GIFT_COST = 2500; 
  bool public constant HAS_ADDITIONAL_REQUIREMENTS = false; 
  
  constructor() 
    LoyaltyGift(
      "Free Coffee", 
      "LPX", 
      "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmUfs1osq6KFJzHRdWEnrsmLq68CSgKJfTpSKXcTYuaNbd"
    ) {}

  function requirementsExchangeMet(address payable _card) external override returns (bool) {
    address payable loyaltyProgram = LoyaltyCard(_card).i_loyaltyProgram(); // gets the card's loyalty program. 
    uint256 balance = LoyaltyProgram(loyaltyProgram).balanceOf(_card); 
    if (balance < GIFT_COST) {
         revert ("Not enough points.");
    }
    return true;
  }

  function requirementsRedeemMet(address payable _card) external override returns (bool) { 
    // there are no specific requirements for redeeming this gift. 
    return true; 
  }
}