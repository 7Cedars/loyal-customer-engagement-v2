// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// OpenZeppelin imports // 
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


// local imports // 
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";


contract BaseLoyaltyGift is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable {


    //////////////////////////////////////////////////////////////////
    //                          Errors                              // 
    //////////////////////////////////////////////////////////////////
    error  LoyaltyGift_CardDoesNotOwnGift(); 
    error LoyaltyGift__IncorrectInterface(); 
    error LoyaltyGift_UnrecognisedFunctionCall(); 

    //////////////////////////////////////////////////////////////////
    //                      Type declarations                       // 
    //////////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////////
    //                       State variables                        // 
    //////////////////////////////////////////////////////////////////
    uint256 private _nextTokenId;
    
    //////////////////////////////////////////////////////////////////
    //                             Events                           // 
    //////////////////////////////////////////////////////////////////
    

    //////////////////////////////////////////////////////////////////
    //                           Modifiers                          // 
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

    //////////////////////////////////////////////////////////////////
    //                           FUNCTIONS                          // 
    //////////////////////////////////////////////////////////////////
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
        Ownable(msg.sender)
    {}

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          // 
    //////////////////////////////////////////////////////////////////
    fallback() external {
        revert LoyaltyGift_UnrecognisedFunctionCall(); 
    }

    //////////////////////////////////////////////////////////////////
    //                          External                            // 
    //////////////////////////////////////////////////////////////////
    /**
        £todo natspec 
     */
    function programTransfer (address _card, uint256 _giftId) external onlyLoyaltyProgram returns (bool success) {
        if (ownerOf(_giftId) != _card) {
            revert LoyaltyGift_CardDoesNotOwnGift(); 
        }
    
        (address card) = _update(msg.sender, _giftId, address(0)); 
        return card != address(0); 
    } 

    //////////////////////////////////////////////////////////////////
    //                           Public                             // 
    /////////////////////////////////////////////////////////////////

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory uri) public onlyLoyaltyProgram onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    //////////////////////////////////////////////////////////////////
    //                          Internal                           // 
    //////////////////////////////////////////////////////////////////
    
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


    //////////////////////////////////////////////////////////////////
    //                          Private                             // 
    //////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////
    //                 View & Pure functions                        // 
    //////////////////////////////////////////////////////////////////
    /** 
        @notice currently does not implement a functionality. Always returns true.  
     */
    function requirementsExchangeMet(address /* _card */) external pure returns (bool) {
        return true;
    }

    /** 
        @notice currently does not implement a functionality. Always returns true.  
    */
    function requirementsRedeemMet(address /*_card */) external pure returns (bool) {
        return true;
    } 

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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
