// SPDX-License-Identifier: MIT

/// NB THIS STILL NEEDS TO BE COMPLETELY ALTERED ACCORDING TO NEW CONTRACT! // 

pragma solidity 0.8.26;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

/// @dev the ERC-165 identifier for this interface is ... 
interface ILoyaltyGift is IERC165, IERC721, IERC721Enumerable, IERC721Metadata {

  function programTransfer(address _card) external; 

  function requirementsExchangeMet(address _card) external view returns (bool); 

  function requirementsRedeemMet(address _card) external view returns (bool);

}
