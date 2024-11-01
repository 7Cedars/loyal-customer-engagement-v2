// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// OpenZeppelin imports // 
import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ERC165Checker} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";
import {ERC721Enumerable} from "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Pausable} from "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// local imports // 
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";

/**
 * Base implementation for Loyalty Gift contracts. 
 * This contract provides the basic logic for implementing the IAccount interface - validateUserOp
 * Specific account implementation should inherit it and provide the account-specific logic.
 */

abstract contract LoyaltyGift is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ILoyaltyGift {
    error LoyaltyGift_CardDoesNotOwnGift(); 
    error LoyaltyGift__IncorrectInterface(); 
    error LoyaltyGift_UnrecognisedFunctionCall(); 
    error LoyaltyGift_ProgramDoesNotOwnGift(); 

    uint256 private _nextTokenId;
    string public i_uri;

    event LoyaltyGiftDeployed(address indexed giftAddress); 

    //////////////////////////////////////////////////////////////////
    /**
        £todo natspec 
     */
    modifier onlyLoyaltyProgram() {
        if (ERC165Checker.supportsInterface(msg.sender, type(ILoyaltyProgram).interfaceId) == false) {
            revert LoyaltyGift__IncorrectInterface();
        }
        _;
    }

    constructor(string memory _name, string memory _symbol, string memory _uri)
        ERC721(_name, _symbol)
        Ownable(msg.sender) 
        {
            i_uri = _uri;
            emit LoyaltyGiftDeployed(address(this));   
        }

    fallback() external {
        revert LoyaltyGift_UnrecognisedFunctionCall(); 
    }

    /**
        £todo natspec 
     */
    function retrieveGiftFromCard(address _card, uint256 _giftId) external onlyLoyaltyProgram returns (bool success) {
        if (ownerOf(_giftId) != _card) {
            revert LoyaltyGift_CardDoesNotOwnGift(); 
        }
    
        (address card) = _update(msg.sender, _giftId, address(0)); 
        return card != address(0); 
    } 

    /**
        £todo natspec 
     */
    function transferGift(address card, uint256 giftId) external onlyLoyaltyProgram returns (bool success) {
        if (ownerOf(giftId) != msg.sender) {
            revert LoyaltyGift_ProgramDoesNotOwnGift(); 
        }
        (address _card) = _update(card, giftId, address(0)); 
        return _card != address(0); 
    } 

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice the uri linked to NFTs is imutable: cannot be changed.
       @notice you mint tokens to msg.sender. 
     */
    function safeMint() public onlyLoyaltyProgram {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, i_uri);
    }

    // batchMint = TBI. 
    
    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

  
    /** 
        @notice currently does not implement a functionality. Always returns true.  -- is this true? or does it return false? 
     */
    function requirementsExchangeMet(address payable /* _card */) external virtual returns (bool);

    /** 
        @notice currently does not implement a functionality. Always returns true.  
    */
    function requirementsRedeemMet(address payable /*_card */) external virtual returns (bool);

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165, ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return 
            interfaceId == type(ILoyaltyGift).interfaceId || 
            super.supportsInterface(interfaceId);
    }
}

    //////////////////////////////////////////////////////////////////
    //                      Acknowledgements                        // 
    //////////////////////////////////////////////////////////////////


    /**
        - Patrick Collins & Cyfrin 
        - solidity by example 
    */


    //////////////////////////////////////////////////////////////////
    //                          Notes to self                       // 
    //////////////////////////////////////////////////////////////////

    // When reviewing this code, check: https://github.com/transmissions11/solcurity
    // see also: https://github.com/nascentxyz/simple-security-toolkit

    // Structure contract // -- from Patrick Collins. 
    /* version */
    /* imports */
    /* errors */
    /* interfaces, libraries, contracts */
    /* Type declarations */
    /* State variables */
    /* Events */
    /* Modifiers */

    /* FUNCTIONS: */
    /* constructor */
    /* receive function (if exists) */
    /* fallback function (if exists) */
    /* external */
    /* public */
    /* internal */
    /* private */
    /* internal & private view & pure functions */
    /* external & public view & pure functions */
