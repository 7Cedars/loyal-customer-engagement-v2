// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {LoyaltyGift} from "../LoyaltyGift.sol";
import {LoyaltyProgram} from "../LoyaltyProgram.sol";
import {LoyaltyCard} from "../LoyaltyCard.sol";

contract FreeCupCake is LoyaltyGift {
  uint256 public constant GIFT_COST = 4500; 
  bool public constant HAS_ADDITIONAL_REQUIREMENTS = false; 
  
  constructor() 
    LoyaltyGift(
      "Free Cupcake", 
      "LPX", 
      "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmbVT4ud4ABEXtjckzRLEGhGouPJyJKJ2mRAsC2UQug1nG"
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
    // there are no specific requirements for redeeming this gift. 
    return true; 
  }
}