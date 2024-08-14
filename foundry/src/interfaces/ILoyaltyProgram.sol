// SPDX-License-Identifier: MIT

/// NB THIS STILL NEEDS TO BE COMPLETELY ALTERED ACCORDING TO NEW CONTRACT! // 

pragma solidity 0.8.26;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from  "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";

/// @dev the ERC-165 identifier for this interface is ... 
interface ILoyaltyProgram is IERC165, IERC721Receiver, IERC20 {
    function requestPointsAndCard(
        address _program,
        uint256 _points, 
        uint256 _uniqueNumber, 
        bytes memory programSignature, 
        address _ownerCard
    ) external; 

    function exchangePointsForGift(
        address _gift,
        address _owner
    ) external; 

    function redeemGift(
        address _program,
        address _ownerCard, 
        address _gift,
        uint256 _giftId,
        uint256 _uniqueNumber, 
        bytes memory signature
    ) external; 

    function mintGifts(address _gift, uint256 amount) external;  

    function setLoyaltyGift(address _gift, bool exchangeable, bool redeemable) external;  

    function setCardBlocked(address _owner, bool blocked) external;

    function setAllowCreationCards(bool allowed) external;

    function setImageUri(string memory imageUri) external;

    function payCardPrefund (uint256 missingAccountFunds, address originalSender) external returns (bool success);
}