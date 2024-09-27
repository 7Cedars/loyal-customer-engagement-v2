// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {LoyaltyGift} from "../LoyaltyGift.sol";
import {LoyaltyProgram} from "../LoyaltyProgram.sol";
import {LoyaltyCard} from "../LoyaltyCard.sol";

contract FreeCoffee is LoyaltyGift {
  uint256 public constant GIFT_COST = 2500; 
  bool public constant HAS_ADDITIONAL_REQUIREMENTS = false; 
  // address[] wrappedgifts = []; // no wrapping possible. -- TBI. 
  
  constructor() 
    LoyaltyGift(
      "GoldToken", 
      "LPX", 
      "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmUfs1osq6KFJzHRdWEnrsmLq68CSgKJfTpSKXcTYuaNbd" // UPDATE 
    ) {}

  // to disallow exchanging of gift all together, just place in a revert. 
  function requirementsExchangeMet(address payable _card) external override returns (bool) { 
    // this gift cannot be claimed in exchange for points. The vendor has to directly send it to the customer. 
    revert ("Not implemented");
  }

  // to disallow redeeming of gift all together, just place in a revert. 
  function requirementsRedeemMet(address payable _card) external override returns (bool) { 
    // this gift cannot be redeemed. 
    revert ("Not implemented");
  }
}