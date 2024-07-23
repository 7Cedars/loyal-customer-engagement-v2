// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// eth-infinitism imports // 

// local imports // 
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

contract LoyaltyProgram is ERC20 {

    //////////////////////////////////////////////////////////////////
    //                          Errors                              // 
    //////////////////////////////////////////////////////////////////
    
    error LoyaltyContract_Only_Owner(); 
    error LoyaltyContract_OnlyLoyaltyCard(); 
    error LoyaltyCard_MoreThanMaxIncrease();
    error LoyaltyContract_NoZeroAddress(); 
    error LoyaltyProgram_GiftNotExchangable(); 
    error LoyaltyProgram_GiftNotRedeemable(); 

    //////////////////////////////////////////////////////////////////
    //                   Type declarations                          // 
    //////////////////////////////////////////////////////////////////
    struct ColourScheme {
        bytes base;
        bytes accent;
    }

    // EIP712 domain separator
    struct EIP712Domain {
        string name;
        uint256 version;
        uint256 chainId;
        address verifyingContract;
    }

    //////////////////////////////////////////////////////////////////
    //                    State variables                           // 
    //////////////////////////////////////////////////////////////////
    
    mapping(address => bool) public redeemableGifts;
    mapping(address => bool) public exchangableGifts;
    mapping(address => bool) private blockedCards; 
    mapping(address => bool) private loyaltyCards; 
    
    uint256 public s_nonce;
    address public s_owner;
    string public s_name;
    string public s_imageUri;
    ColourScheme public s_colourScheme; 

    bytes32 private immutable DOMAIN_SEPARATOR;

    uint256 private constant MAX_INCREASE_NONCE = 100;
    uint256 private constant LP_VERSION = 2;   

    //////////////////////////////////////////////////////////////////
    //                          Events                              // 
    //////////////////////////////////////////////////////////////////

    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed s_owner, uint256 indexed version);
    event LoyaltyGiftAdded(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerExchangable(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerRedeemable(address indexed loyaltyGift);

    //////////////////////////////////////////////////////////////////
    //                        Modifiers                             // 
    //////////////////////////////////////////////////////////////////

    modifier only_Owner() { 
        if (msg.sender != s_owner) {
            revert LoyaltyContract_Only_Owner();
        }
        _; 
    }

    modifier onlyLoyaltyCard() { 
        if (!loyaltyCards[msg.sender]) {
            revert LoyaltyContract_OnlyLoyaltyCard();
        }
        
        _; 
    }

    modifier noZeroAddress(address _address) {
        if (_address == address(0)) {
            revert LoyaltyContract_NoZeroAddress();
        }
        _;
    }

    //////////////////////////////////////////////////////////////////
    //                        FUNCTIONS                             // 
    //////////////////////////////////////////////////////////////////

    constructor(
        string memory _name, 
        string memory _cardImageUri, 
        bytes memory _baseColour, 
        bytes memory _accentColour
    ) ERC20("LoyaltyPoints", "LPX") {
        sets_Owner(msg.sender); 
        _mint(address(this), type(uint256).max);

        s_name = _name; 
        s_imageUri = _cardImageUri;
        s_colourScheme = ColourScheme({
            base: _baseColour, 
            accent: _accentColour
        }); 

        DOMAIN_SEPARATOR = hashDomain(
            EIP712Domain({
                name: _name,
                version: LP_VERSION,
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );

        emit LoyaltyProgramDeployed(s_owner, LP_VERSION);
    }

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          // 
    //////////////////////////////////////////////////////////////////

    // both these are direct copies from https://solidity-by-example.org/fallback/
    fallback() external payable {
        emit Log("fallback", gasleft());
    }

    receive() external payable {
        emit Log("receive", gasleft());
    }


    //////////////////////////////////////////////////////////////////
    //                          External                            // 
    //////////////////////////////////////////////////////////////////
    function addLoyaltyGift(address _gift) external only_Owner {
        // £todo activate later: 
        // if (!ERC165Checker.supportsInterface(loyaltyGiftAddress, type(ILoyaltyGift).interfaceId)) {
        //     revert LoyaltyProgram__IncorrectInterface(loyaltyGiftAddress);
        // }        
        exchangableGifts[_gift] = true;
        redeemableGifts[_gift] = true; 
        
        emit LoyaltyGiftAdded(_gift); 
    }

    function removeLoyaltyGiftExchangable(address _gift) external only_Owner {
        if (!exchangableGifts[_gift]) { 
            revert LoyaltyProgram_GiftNotExchangable(); 
        }
        exchangableGifts[_gift] = false;

        emit LoyaltyGiftNoLongerExchangable(_gift);
    }
    
    function removeLoyaltyGiftRedeemable(address _gift) external only_Owner {
        if (!redeemableGifts[_gift]) { 
            revert LoyaltyProgram_GiftNotRedeemable(); 
        }
        exchangableGifts[_gift] = false; 
        redeemableGifts[_gift] = false;
        
        emit LoyaltyGiftNoLongerExchangable(_gift);
        emit LoyaltyGiftNoLongerRedeemable(_gift); 
    }

    //////////////////////////////////////////////////////////////////
    //                           Public                             // 
    /////////////////////////////////////////////////////////////////

    function sets_Owner(address _news_Owner) public only_Owner {
        s_owner = _news_Owner; 
    } 
    
    /**
     @notice increases the s_nonce by a given amount. 
     Allows for efficient creation of unique loyalty point vouchers.  
     */
    function increaseNonce(uint256 _increase) public only_Owner {
        if (_increase > MAX_INCREASE_NONCE) {
            revert LoyaltyCard_MoreThanMaxIncrease(); 
        }
        s_nonce = s_nonce + _increase;
    } 

    //////////////////////////////////////////////////////////////////
    //                          Internal                           // 
    //////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////
    //                          Private                             // 
    //////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////
    //                 View & Pure functions                        // 
    //////////////////////////////////////////////////////////////////

    /**
     * @notice helper function to create EIP712 Domain separator.
     */
    function hashDomain(EIP712Domain memory domain) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,uint256 version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(domain.name)),
                domain.version,
                domain.chainId,
                domain.verifyingContract
            )
        );
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
