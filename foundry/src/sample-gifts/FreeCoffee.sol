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
            "Free Coffee",
            "LPX",
            "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmUfs1osq6KFJzHRdWEnrsmLq68CSgKJfTpSKXcTYuaNbd"
        )
    {}

    // to disallow exchanging of gift all together, just place in a revert.
    function requirementsExchangeMet(address payable _card) external override returns (bool) {
        // check if valid card.
        try LoyaltyCard(_card).s_loyaltyProgram() returns (address payable loyaltyProgram) {
            uint256 balance = LoyaltyProgram(loyaltyProgram).balanceOf(_card); // get the cards balance.
            // if so, check if suffiicient points
            if (balance < GIFT_COST) {
                revert("Not enough points.");
            }
            return true;
            // if not a valid card, revert.
        } catch {
            revert("Not a valid loyalty card.");
        }
    }

    // to disallow redeeming of gift all together, just place in a revert.
    function requirementsRedeemMet(address payable _card) external override returns (bool) {
        // there are no specific requirements for redeeming this gift.
        return true;
    }
}
