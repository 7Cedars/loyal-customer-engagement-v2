// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from  "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports // 
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

contract LoyaltyProgram is IERC721Receiver, ERC20 {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using ERC165Checker for address;

    //////////////////////////////////////////////////////////////////
    //                          Errors                              // 
    //////////////////////////////////////////////////////////////////
    
    error LoyaltyContract_OnlyOwner(); 
    error LoyaltyContract_OnlyLoyaltyCard(); 
    error LoyaltyCard_MoreThanMaxIncrease();
    error LoyaltyContract_NoZeroAddress(); 
    error LoyaltyProgram_GiftNotExchangable(); 
    error LoyaltyProgram_GiftNotRedeemable(); 
    error LoyaltyProgram__IncorrectInterface(address gift); 
    error LoyaltyContract_BlockedLoyaltyCard(address card); 
    error LoyaltyProgram__AlreadyExecuted(); 
    error LoyaltyProgram__RequestNotFromOwner(); 
    error LoyaltyProgram__NotRegisteredCard(); 
    error LoyaltyProgram__RequestNotFromCorrectCard();
    error LoyaltyProgram__CardDoesNotOwnGift(); 

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

    // RequestPoints message struct
    struct RequestPoints {
        address program;
        uint256 points;
    }

    // RedeemGift message struct
    struct RedeemGift {
        address card;
        address gift;
        uint256 giftId;
    }

    //////////////////////////////////////////////////////////////////
    //                    State variables                           // 
    //////////////////////////////////////////////////////////////////
    
    mapping(address => bool) public s_redeemableGifts;
    mapping(address => bool) public s_exchangableGifts;
    mapping(address => bool) private _blockedCards; 
    mapping(address => bool) private _registeredCards; 
    mapping(bytes32 => bool) private _executed;  // combines RequestPoints and RedeemGift hashes.

    uint256 public s_nonce;
    address public s_owner;
    string public s_name;
    string public s_imageUri;
    ColourScheme public s_colourScheme; 

    RequestPoints private _requestPoints; 
    RedeemGift private _redeemGift;  
    
    bytes32 private immutable DOMAIN_SEPARATOR;
    IEntryPoint private immutable _entryPoint; 

    uint256 private constant MAX_INCREASE_NONCE = 100;
    uint256 private constant LOYALTY_PROGRAM_VERSION = 2;   

    //////////////////////////////////////////////////////////////////
    //                          Events                              // 
    //////////////////////////////////////////////////////////////////

    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed s_owner, uint256 indexed version);
    event LoyaltyGiftAdded(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerExchangable(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerRedeemable(address indexed loyaltyGift);
    event LoyaltyPointsTransferred(address card, uint256 points); 
    event LoyaltyGiftRedeemed(address card, address gift, uint256 giftId); 

    //////////////////////////////////////////////////////////////////
    //                        Modifiers                             // 
    //////////////////////////////////////////////////////////////////


    // £todo: import from OpenZeppelin's Ownable. Cleans up code. 
    modifier onlyOwner() { 
        if (msg.sender != s_owner) {
            revert LoyaltyContract_OnlyOwner();
        }
        _; 
    }

    modifier onlyLoyaltyCard() { 
        if (!_registeredCards[msg.sender]) {
            revert LoyaltyContract_OnlyLoyaltyCard();
        }
        _; 
    }

    modifier noBlockedCard(address _card ) { 
        if (_blockedCards[_card]) {
            revert LoyaltyContract_BlockedLoyaltyCard(_card);
        }
        _; 
    }

    modifier noZeroAddress(address _address) {
        if (_address == address(0)) {
            revert LoyaltyContract_NoZeroAddress();
        }
        _;
    }

    function entryPoint() public view returns (IEntryPoint) {
        return _entryPoint;
    }

    //////////////////////////////////////////////////////////////////
    //                        FUNCTIONS                             // 
    //////////////////////////////////////////////////////////////////
    
    /**
        £todo: natspec
    */
    constructor(
        string memory _name, 
        string memory _cardImageUri, 
        bytes memory _baseColour, 
        bytes memory _accentColour, 
        IEntryPoint _anEntryPoint
    ) ERC20("LoyaltyPoints", "LPX") {
        set_Owner(msg.sender); 
        _mint(address(this), type(uint256).max);

        s_name = _name; 
        s_imageUri = _cardImageUri;
        _entryPoint = _anEntryPoint; 

        s_colourScheme = ColourScheme({
            base: _baseColour, 
            accent: _accentColour
        }); 

        DOMAIN_SEPARATOR = hashDomain(
            EIP712Domain({
                name: _name,
                version: LOYALTY_PROGRAM_VERSION,
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );

        emit LoyaltyProgramDeployed(s_owner, LOYALTY_PROGRAM_VERSION);
    }

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          // 
    //////////////////////////////////////////////////////////////////

    // both these are direct copies from https://solidity-by-example.org/fallback/
    // £todo: this should transfer directly to deposit! 
    fallback() external payable {
        emit Log("fallback", gasleft());
    }

    receive() external payable {
        emit Log("receive", gasleft());
    }


    //////////////////////////////////////////////////////////////////
    //                          External                            // 
    //////////////////////////////////////////////////////////////////
    /**
        £todo: natspec
        // receives signedMessage, should have been signed by owner of this loyalty prgram. 
        // check if signature is from this address. 
        // check if account is a LoyaltyCard
            - if yes: continue with adress 
            - if no : create a LoyaltyCard - and use this address. 
        // read amount of points to be given. 
        // transfer points to loyalty card/ 
        // emit event pointsTransferred(address card, uint256 points).  
    */
    function requestPointsAndCard(
        address _program,
        uint256 _points, 
        bytes memory signature
    ) external {
        address card = msg.sender;   
        // filling up RequestGift struct with provided data.
        _requestPoints.program = _program; 
        _requestPoints.points = _points;

        // creating digest & using it to recover loyalty program  address. 
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(_requestPoints));
        address signer = digest.recover(signature);

        // Checks. 
        // Check that digest has not already been executed.
        if (_executed[digest]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // Check if signer is owner. 
        if (signer != s_owner) {
            revert LoyaltyProgram__RequestNotFromOwner();
        }
        
        // if msg.sender is not a registered loyalty card, create a new card and continue with this. 
        // this will emit a CardCreated event.  
        if (!_registeredCards[card]) {
            card = _createLoyaltyCard();
        }

        // 1) set executed to true & execute transfer
        _executed[digest] = true;
        transferFrom(address(this), card, _points);

        emit LoyaltyPointsTransferred(card, _points);   
    }

    /**
        £todo outline internal function 
    */
    function exchangePointsForGift(
        address _gift
    ) external onlyLoyaltyCard {
        // £todo write function.. 
    }


    /**
        £todo: natspec

        £todo outline internal function 
    */
    function redeemGift(
        address _program,
        address _card, 
        address _gift,
        uint256 _giftId,  
        bytes memory signature
    ) external {   
        // filling up RequestGift struct with provided data.
        _redeemGift.card = _card; 
        _redeemGift.gift = _gift;
        _redeemGift.giftId = _giftId;

        // creating digest & using it to recover loyalty program  address. 
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRedeemGift(_redeemGift));
        address signer = digest.recover(signature);

        // CHECK. 
        // Check that digest has not already been executed.
        if (_executed[digest]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // check if request comes from registered loyalty card
        if (!_registeredCards[_card]) {
            revert LoyaltyProgram__NotRegisteredCard();
        }

        // Check if signer is loyalty card. 
        if (signer != _card) {
            revert LoyaltyProgram__RequestNotFromCorrectCard();
        }

        // Check if loyalty card owns the gift to be redeemed. 
        if (ILoyaltyGift(_gift).ownerOf(_giftId) != _card) {
            revert LoyaltyProgram__CardDoesNotOwnGift();
        }

        // EXECUTE 
        // 1) set executed to true
        _executed[digest] = true;

        // INTERACT
        // this function still needs to be written. 
        // the following data should be sufficient... 
        ILoyaltyGift(_gift).programTransfer(_card); 

        emit LoyaltyGiftRedeemed(_card, _gift, _giftId); 
    }

    /**
        £todo: natspec
     */
    function addLoyaltyGift(address _gift) external onlyOwner { 
        if (!ERC165Checker.supportsInterface(_gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(_gift);
        }        
        s_exchangableGifts[_gift] = true;
        s_redeemableGifts[_gift] = true; 
        
        emit LoyaltyGiftAdded(_gift); 
    }

    /**
        £todo: natspec
     */
    function removeLoyaltyGiftExchangable(address _gift) external onlyOwner {
        if (!s_exchangableGifts[_gift]) { 
            revert LoyaltyProgram_GiftNotExchangable(); 
        }
        s_exchangableGifts[_gift] = false;

        emit LoyaltyGiftNoLongerExchangable(_gift);
    }
    
    /**
        £todo: natspec
     */
    function removeLoyaltyGiftRedeemable(address _gift) external onlyOwner {
        if (!s_redeemableGifts[_gift]) { 
            revert LoyaltyProgram_GiftNotRedeemable(); 
        }
        s_exchangableGifts[_gift] = false; 
        s_redeemableGifts[_gift] = false;
        
        emit LoyaltyGiftNoLongerExchangable(_gift);
        emit LoyaltyGiftNoLongerRedeemable(_gift); 
    }

    /**
        £todo: natspec
     */
    function blockCard(address _card) external onlyOwner {
        _blockedCards[_card] = true; 
    }

    /**
        £todo: natspec
     */
    function unblockCard(address _card) external onlyOwner {
        _blockedCards[_card] = false; 
    }

    //////////////////////////////////////////////////////////////////
    //                           Public                             // 
    /////////////////////////////////////////////////////////////////
    /**
    * @notice only owner is allowed to transfer points.   
    */
    function transfer(address to, uint256 value) public override onlyOwner returns (bool) {
        (bool success) = super.transfer(to, value); 
        return success; 
    }
    
    function set_Owner(address _news_Owner) public onlyOwner {
        s_owner = _news_Owner; 
    } 
    
    /**
     @notice increases the s_nonce by a given amount. 
     Allows for efficient creation of unique loyalty point vouchers.  
     */
    function increaseNonce(uint256 _increase) public onlyOwner {
        if (_increase > MAX_INCREASE_NONCE) {
            revert LoyaltyCard_MoreThanMaxIncrease(); 
        }
        s_nonce = s_nonce + _increase;
    } 

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner() {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    //////////////////////////////////////////////////////////////////
    //                          Internal                           // 
    //////////////////////////////////////////////////////////////////
    
    /**
        £todo: natspec
     */
    function _createLoyaltyCard() internal returns (address newCard) {
        // £todo implement this function. See examples from eth_infinitism. 

        // NB! before transferring card to new owner / wallet. Set approve to max. 
        // this is needed to give loyalty card full power over points. 
        // approve(address(this), type(uint256).max); 

        return address(0);  
    }

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

    /**
     * @notice helper function to create digest hash from RequestPoints struct.
     */
    function hashRequestPoints(RequestPoints memory message) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(bytes("RequestPoints(address program,uint256 points)")),
                message.program,
                message.points
            )
        );
    }

    /**
     * @notice helper function to create digest hash from RedeemGift struct.
     */
    function hashRedeemGift(RedeemGift memory message) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(bytes("RedeemGift(address card,address gift,uint256 giftId)")),
                message.card,
                message.gift,
                message.giftId
            )
        );
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
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
