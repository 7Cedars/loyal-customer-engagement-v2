// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {LoyaltyGift} from "../LoyaltyGift.sol"


contract FreeCoffee is LoyaltyGift {
  uint256 public constant GIFT_COST = 2500; 
  bool public constant HAS_ADDITIONAL_REQUIREMENTS = false; 
  string public constant URI = 



  function requirementsExchangeMet(address _card) external returns (bool) {

  }

  function requirementsRedeemMet(address _card) external returns (bool) { 
    // there are no specific requirements for redeeming this gift. 
    return true 
  }
}