// SPDX-License-Identifier: MIT

/// NB THIS STILL NEEDS TO BE COMPLETELY ALTERED ACCORDING TO NEW CONTRACT! // 

pragma solidity 0.8.26;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from  "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @dev the ERC-165 identifier for this interface is ... 
interface ILoyaltyProgram is IERC165, IERC721Receiver, IERC721 {
    function requestPointsAndCard(address _program, uint256 _points, bytes memory signature) external; 

    function exchangePointsForGift(address _gift) external;

    function redeemGift(address _program, address _card, address _gift, uint256 _giftId, bytes memory signature) external;

    function addLoyaltyGift(address _gift) external;

   
    function removeLoyaltyGiftExchangable(address _gift) external;
    
    function removeLoyaltyGiftRedeemable(address _gift) external;

    function blockCard(address _card) external;

    function unblockCard(address _card) external;

    function payCardPrefund (uint256 missingAccountFunds, address originalSender) external;


}