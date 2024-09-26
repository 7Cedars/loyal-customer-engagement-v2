// SPDX-License-Identifier: MIT

/// NB THIS STILL NEEDS TO BE COMPLETELY ALTERED ACCORDING TO NEW CONTRACT! // 

pragma solidity 0.8.26;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from  "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";

/// @dev the ERC-165 identifier for this interface is ... 
interface ILoyaltyProgram is IERC165, IERC721Receiver, IERC20 {
    function requestPoints(
        address program,
        uint256 points, 
        uint256 uniqueNumber, 
        address ownerCard, 
        bytes memory programSignature
    ) external; 

    function exchangePointsForGift(
        address gift,
        address owner
    ) external; 

    function redeemGift(
        address program,
        address ownerCard, 
        address gift,
        uint256 giftId,
        uint256 uniqueNumber, 
        bytes memory signature
    ) external; 

    function mintGifts(address gift, uint256 amount) external;  

    function setAllowedGift(address gift, bool exchangeable, bool redeemable) external; 

    function setCardBlocked(address owner, bool blocked) external;

    function setAllowCreationCards(bool allowed) external;

    function setImageUri(string memory imageUri) external;

    function payCardPrefund (uint256 missingAccountFunds, address originalSender) external returns (bool success);
}