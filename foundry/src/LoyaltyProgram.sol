// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from  "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports // 
import {LoyaltyCard} from "./LoyaltyCard.sol";
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
    error LoyaltyContract_BlockedLoyaltyCard(); 
    error LoyaltyProgram__AlreadyExecuted(); 
    error LoyaltyProgram__RequestNotFromOwner(); 
    error LoyaltyProgram__NotRegisteredCard(); 
    error LoyaltyProgram__RequestNotFromCorrectCard();
    error LoyaltyProgram__CardDoesNotOwnGift(); 
    error LoyaltyProgram_GiftExchangeFailed(); 
    error LoyaltyProgram_OnlyEntryPoint(); 

    //////////////////////////////////////////////////////////////////
    //                   Type declarations                          // 
    //////////////////////////////////////////////////////////////////
    // enum Colours {
    //     Pending,
    //     Shipped,
    //     Accepted,
    //     Rejected,
    //     Canceled
    // }
    
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
    address public s_owner; // £todo  should take this from OpenZeppelin's ownable. 
    string public s_name; // £todo should this not be immutable? 
    string public s_imageUri;
    ColourScheme public s_colourScheme; 

    RequestPoints private _requestPoints; 
    RedeemGift private _redeemGift;  
    
    bytes32 private immutable DOMAIN_SEPARATOR;
    IEntryPoint private immutable _entryPoint; 
    LoyaltyCard public immutable cardImplementation;

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
    event LoyaltyPointsTransferred(address indexed card, uint256 indexed points); 
    event LoyaltyPointsExchangeForGift(address indexed card, address indexed _gift, uint256 indexed giftId); 
    event LoyaltyGiftRedeemed(address indexed card, address indexed gift, uint256 indexed giftId); 
    
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

    modifier noBlockedCard() { 
        if (_blockedCards[msg.sender]) {
            revert LoyaltyContract_BlockedLoyaltyCard();
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
    
    /**
        £todo: natspec
    */
    constructor(
        string memory _name, 
        string memory _cardImageUri, 
        bytes memory _baseColour, 
        bytes memory _accentColour, 
        address _anEntryPoint
    ) ERC20("LoyaltyPoints", "LPX") {
        set_Owner(msg.sender); 
        _mint(address(this), type(uint256).max);

        s_name = _name; 
        s_imageUri = _cardImageUri;
        _entryPoint = IEntryPoint(_anEntryPoint); 

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

        cardImplementation = new LoyaltyCard(_entryPoint, payable(address(this)));

        emit LoyaltyProgramDeployed(s_owner, LOYALTY_PROGRAM_VERSION);
    }

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          // 
    //////////////////////////////////////////////////////////////////

    // both these are direct copies from https://solidity-by-example.org/fallback/
    // this should transfer directly to deposit! / NO! It should go to the balance of this account! 
    // only the deposits of the _loyalty cards_ need to be filled up! 
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
        // filling up RequestGift struct with provided data.
        address sendPointsTo = msg.sender; 
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
        
        // if msg.sender is not a registered loyalty card, create a new card and set owner of card to msg.sender. 
        // this will emit a CardCreated event.  
        // £improvement: I can check if card belongs to program with an erc-167(?) check + check from card themselves. 
        // This would enable taking out the _registeredCards mapping. 
        // £todo: more generally, this code is a bit convoluted now. 
        if (!_registeredCards[msg.sender]) {
            s_nonce = s_nonce++;  
            LoyaltyCard card = _createLoyaltyCard(msg.sender, s_nonce);
            _registeredCards[address(card)] = true;
            sendPointsTo = address(card); 
        }

        // 1) set executed to true & execute transfer
        _executed[digest] = true;
        transferFrom(address(this), sendPointsTo, _points);

        emit LoyaltyPointsTransferred(sendPointsTo, _points);   
    }

    /**
        £todo outline internal function 
    */
    function exchangePointsForGift(
        address _gift
    ) external onlyLoyaltyCard {
        // CHECK 
        // check if request comes from registered loyalty card
        if (!_registeredCards[msg.sender]) {
            revert LoyaltyProgram__NotRegisteredCard();
        }

        // if requerements not met, this function reverts with the reason why. 
        // also checks for balance on card. 
        ILoyaltyGift(_gift).requirementsExchangeMet(payable(msg.sender)); 

        // effect 
        // retrieve points
        (bool success) = transferFrom(
            msg.sender, 
            address(this), 
            ILoyaltyGift(_gift).GIFT_COST()
        ); 
        if (!success) {
            revert LoyaltyProgram_GiftExchangeFailed(); 
        }

        // interact
        // £note: first time I use this function, need to properly try it out.. 
        // Get a tokenId owned by loyalty program. 
        // if balance == 0, reverts with ERC721OutOfBoundsIndex
        uint256 giftId = ILoyaltyGift(_gift).tokenOfOwnerByIndex(address(this), 0); 
        ILoyaltyGift(_gift).safeTransferFrom(address(this), msg.sender, giftId); 

        // emit. 
        emit LoyaltyPointsExchangeForGift(msg.sender, _gift, giftId); 
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

        // Check if requirements for redeem are met. 
        // if requerements not met, this function reverts with the reason why.  
        ILoyaltyGift(_gift).requirementsRedeemMet(payable(msg.sender)); 

        // EFFECT 
        // 1) set executed to true
        _executed[digest] = true;

        // INTERACT
        // this function still needs to be written. 
        // the following data should be sufficient... 
        ILoyaltyGift(_gift).programTransfer(_card, _giftId); 

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


    /**
     @notice the loyalty program pays for all transactions of its loyalty card - without any checks. 
     // this is only possible because the transactions of the loyalty cards are highly restricted. 
     // only 'pre-approved' transactions are allowed. 
     */
    function payCardPrefund (uint256 missingAccountFunds, address originalSender) external onlyLoyaltyCard noBlockedCard returns (bool success) {
        // check if the call origninated from the entrypoint. 
        if (originalSender != address(_entryPoint)) { 
            revert LoyaltyProgram_OnlyEntryPoint(); 
        }
        // £todo improve error handling.
        _addDepositCard(msg.sender, missingAccountFunds); 
        return true; 
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

    //////////////////////////////////////////////////////////////////
    //                          Internal                           // 
    //////////////////////////////////////////////////////////////////
    
    /**
     * exact copy from SimpleAccountFactory.sol, except here it is an internal function. 
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function _createLoyaltyCard(address newOwner, uint256 salt) internal returns (LoyaltyCard newCard) {
        address addr = _getAddress(s_owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return LoyaltyCard(payable(addr));
        }
        newCard = LoyaltyCard(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(cardImplementation),
                abi.encodeCall(LoyaltyCard.initialize, (s_owner))
            )));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function _addDepositCard(address _card, uint256 _value) internal {
        entryPoint().depositTo{value: _value}(_card);
    }

    //////////////////////////////////////////////////////////////////
    //                          Private                             // 
    //////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////
    //                 View & Pure functions                        // 
    //////////////////////////////////////////////////////////////////
        /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     * exact copy from SimpleAccountFactory.sol, except here it is an internal function. 
     */
    function _getAddress(address owner,uint256 salt) internal view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(cardImplementation),
                    abi.encodeCall(LoyaltyCard.initialize, (owner))
                )
            )));
    }

    /**
     * check current account deposit in the entryPoint
     */
    function _getDepositCard(address _card) internal view returns (uint256) {
        return entryPoint().balanceOf(_card);
    }

    /**
     * £todo add natspec
     */
    function entryPoint() public view returns (IEntryPoint) {
        return _entryPoint;
    }


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
