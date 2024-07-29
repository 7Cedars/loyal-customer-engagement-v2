// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol";
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from  "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports // 
import {LoyaltyCard} from "./LoyaltyCard.sol";
import {LoyaltyGift} from "./LoyaltyGift.sol";
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

/// ONLY FOR TESTING
import {console2} from "lib/forge-std/src/Test.sol";

contract LoyaltyProgram is IERC721Receiver, ERC165, ERC20, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using ERC165Checker for address;

    //////////////////////////////////////////////////////////////////
    //                          Errors                              // 
    //////////////////////////////////////////////////////////////////
    error LoyaltyProgram__OnlyCardHolder(); 
    error LoyaltyProgram__MoreThanMaxIncrease();
    error LoyaltyProgram__OLoyaltyProgram__NoZeroAddressnlyLoyaltyCard(); 
    error LoyaltyProgram__GiftNotExchangeable(); 
    error LoyaltyProgram__GiftNotRedeemable(); 
    error LoyaltyProgram__IncorrectInterface(address gift); 
    error LoyaltyProgram__BlockedLoyaltyCard(); 
    error LoyaltyProgram__AlreadyExecuted(); 
    error LoyaltyProgram__RequestNotFromProgramOwner(); 
    error LoyaltyProgram__NotRegisteredCard(); 
    error LoyaltyProgram__NotSignedByOwner();
    error LoyaltyProgram__CardDoesNotOwnGift(); 
    error LoyaltyProgram__GiftExchangeFailed(); 
    error LoyaltyProgram__OnlyEntryPoint(); 

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
        address program; 
        address owner;
        address gift;
        uint256 giftId;
    }

    // RedeemGift message struct
    struct AccessGift {
        bool redeemable;
        bool exchangeable;
    }

    //////////////////////////////////////////////////////////////////
    //                    State variables                           // 
    //////////////////////////////////////////////////////////////////
    mapping(address => AccessGift) public s_AccessGifts;
    mapping(bytes => bool) public s_executed;  // combines RequestPoints and RedeemGift hashes.
    mapping(address => bool) private _blockedCards; 
    

    uint256 public s_nonce;
    string public s_name;
    string public s_imageUri;
    ColourScheme public s_colourScheme; 
    bool public s_allowCreationCards = true; 

    RequestPoints private _requestPoints; 
    RedeemGift private _redeemGift;  
    
     
    bytes32 private immutable DOMAIN_SEPARATOR;
    IEntryPoint private immutable _entryPoint; 
    LoyaltyCard public immutable cardImplementation;

    uint256 private constant MAX_INCREASE_NONCE = 100;
    uint256 private constant LOYALTY_PROGRAM_VERSION = 2;
    uint256 private constant SALT = 123456; 
    
    //////////////////////////////////////////////////////////////////
    //                          Events                              // 
    //////////////////////////////////////////////////////////////////
    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed owner, uint256 indexed version);
    event LoyaltyGiftListed(address indexed loyaltyGift, bool indexed exchangeable, bool indexed redeemable);
    event LoyaltyPointsExchangeForGift(address indexed owner, address indexed _gift, uint256 indexed giftId); 
    event LoyaltyGiftRedeemed(address indexed owner, address indexed gift, uint256 indexed giftId); 
    event LoyaltyCardBlocked (address indexed owner, bool indexed blocked);
    event CreationCardsAllowed(bool indexed allowed); 
    event GiftsMinted(address indexed gift, uint256 indexed amount); 
    event ColourSchemeChanged(bytes indexed base, bytes indexed accent);
    event ImageUriChanged(); 

    //////////////////////////////////////////////////////////////////
    //                        Modifiers                             // 
    //////////////////////////////////////////////////////////////////
    modifier onlyCardHolder(address caller) {
        address addr = getAddress(caller, SALT);
        uint256 codeSize = addr.code.length;
        if (codeSize == 0) {
        revert LoyaltyProgram__OnlyCardHolder();
        }

        _; 
    }

    modifier noBlockedCard() { 
        if (_blockedCards[msg.sender]) {
            revert LoyaltyProgram__BlockedLoyaltyCard();
        }
        _; 
    }

    modifier noZeroAddress(address _address) {
        if (_address == address(0)) {
            revert LoyaltyProgram__OLoyaltyProgram__NoZeroAddressnlyLoyaltyCard();
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
    ) ERC20("LoyaltyPoints", "LPX") Ownable(msg.sender) {
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

        emit LoyaltyProgramDeployed(owner(), LOYALTY_PROGRAM_VERSION);
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

        £ NB: this function is called by loyaltyCard that calls this function.  
    */
    function requestPointsAndCard(
        address _program,
        uint256 _points, 
        bytes memory programSignature, 
        address _ownerCard
    ) external {
        // filling up RequestGift struct with provided data.
        _requestPoints.program = _program; 
        _requestPoints.points = _points;

        // creating digest & using it to recover loyalty program  address. 
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(_requestPoints));
        address signer = digest.recover(programSignature);

        // Checks.
        if (signer != owner()) {
            revert LoyaltyProgram__RequestNotFromProgramOwner();
        }

        // Check that digest has not already been executed.
        if (s_executed[programSignature]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // if msg.sender is not a registered loyalty card, create a new card and set owner of card to msg.sender. 
        LoyaltyCard card = _getLoyaltyCard(_ownerCard, SALT);

        // 1) set executed to true & execute transfer
        s_executed[programSignature] = true;
        _update(address(this), address(card), _points); // emits a transfer event 
    }

    /**
        £todo outline internal function 

        £ NB: it is the loyaltyCard that calls this function.
    */
    function exchangePointsForGift(
        address _gift,
        address _owner
    ) external onlyCardHolder(_owner) {
        // CHECK 
        // check if gift eexchangeable. 
        if (!s_AccessGifts[_gift].exchangeable){ 
            revert LoyaltyProgram__GiftNotExchangeable(); 
        }

        address cardAddress = getAddress(_owner, SALT);

        // if requerements not met, this function reverts with the reason why. 
        // also checks for balance on card. 
        ILoyaltyGift(_gift).requirementsExchangeMet(payable(cardAddress)); 

        // effect 
        // retrieve points
        _update(
            cardAddress, 
            address(this), 
            ILoyaltyGift(_gift).GIFT_COST()
        ); // emits a transfer event

        // interact
        // £note: first time I use this function, need to properly try it out.. 
        // Get a tokenId owned by loyalty program. 
        // if balance == 0, reverts with ERC721OutOfBoundsIndex
        uint256 giftId = ILoyaltyGift(_gift).tokenOfOwnerByIndex(address(this), 0); 
        ILoyaltyGift(_gift).safeTransferFrom(address(this), cardAddress, giftId); 

        // emit. 
        emit LoyaltyPointsExchangeForGift(_owner, _gift, giftId); 
    }


    /**
        £todo: natspec

        £todo outline internal function 
        £ NB: it is the owner of the loyalty program that calls this function. 
    */
    function redeemGift(
        address _program,
        address _ownerCard, 
        address _gift,
        uint256 _giftId,  
        bytes memory signature
    ) external {   
        // filling up RequestGift struct with provided data. 
        _redeemGift.program = _program; 
        _redeemGift.owner = _ownerCard; 
        _redeemGift.gift = _gift;
        _redeemGift.giftId = _giftId;

        // creating digest & using it to recover loyalty program  address. 
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRedeemGift(_redeemGift));
        address signer = digest.recover(signature);

        // CHECK. 
        // Check that digest has not already been executed.
        if (s_executed[signature]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // Check if signer is loyalty card. 
        if (signer != _ownerCard) {
            revert LoyaltyProgram__NotSignedByOwner();
        }

        // check if request comes from registered loyalty card
        address cardAddress = getAddress(_ownerCard, SALT);
        uint256 codeSize = cardAddress.code.length;
        if (codeSize == 0) {
            revert LoyaltyProgram__NotRegisteredCard();
        }

        // check if gift is redeemable.         
        if (!s_AccessGifts[_gift].redeemable) {
            revert LoyaltyProgram__GiftNotRedeemable();
        }

        // Check if loyalty card owns the gift to be redeemed. 
        if (ILoyaltyGift(_gift).ownerOf(_giftId) != cardAddress) {
            revert LoyaltyProgram__CardDoesNotOwnGift();
        }

        // Check if requirements for redeem are met. 
        // if requerements not met, this function reverts with the reason why.  
        ILoyaltyGift(_gift).requirementsRedeemMet(payable(cardAddress)); 

        // EFFECT 
        // 1) set executed to true
        s_executed[signature] = true;

        // INTERACT
        ILoyaltyGift(_gift).retrieveGiftFromCard(cardAddress, _giftId); 

        emit LoyaltyGiftRedeemed(_ownerCard, _gift, _giftId); 
    }


    /**
        £todo: natspec
     */
    function mintGifts(address _gift, uint256 amount) external onlyOwner {
        if (!ERC165Checker.supportsInterface(_gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(_gift);
        }
        // Note: no other checks. The owner of the loyalty program can mint gifts that are not exchangeable and/or redeemable. 
        // this is _very_ inefficient / expensive...
        for (uint256 i; i < amount; i++) {
            LoyaltyGift(_gift).safeMint(); 
        }
        emit GiftsMinted(_gift, amount); 
    }

    /**
        £todo: natspec
     */
    function setLoyaltyGift(address _gift, bool exchangeable, bool redeemable) external onlyOwner { 
        if (!ERC165Checker.supportsInterface(_gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(_gift);
        }
        s_AccessGifts[_gift].exchangeable = exchangeable; 
        s_AccessGifts[_gift].redeemable = redeemable; 
        
        emit LoyaltyGiftListed(_gift, exchangeable, redeemable); 
    }


    /**
        £todo: natspec
     */
    function setCardBlocked(address _owner, bool blocked) external onlyOwner {
        address cardAddress = getAddress(_owner, SALT); 
        _blockedCards[cardAddress] = blocked; 

        emit LoyaltyCardBlocked(_owner, blocked); 
    }

    /**
        £todo: natspec
     */
    function setAllowCreationCards(bool allowed) external onlyOwner {
        s_allowCreationCards = allowed; 

        emit CreationCardsAllowed(allowed); 
    }

    /**
        £todo: natspec
     */
    function setColourScheme(bytes memory base, bytes memory accent) external onlyOwner {
        s_colourScheme.base = base; 
        s_colourScheme.accent = accent; 

        emit ColourSchemeChanged(base, accent); 
    }

    /**
        £todo: natspec
     */
    function setImageUri(string memory imageUri) external onlyOwner {
        s_imageUri = imageUri; 

        emit ImageUriChanged(); // £note to self: cannot save string as is in event. it's hex is of no use.  
    }



    /**
     @notice the loyalty program pays for all transactions of its loyalty card - without any checks. 
     // this is only possible because the transactions of the loyalty cards are highly restricted. 
     // only 'pre-approved' transactions are allowed. 
     // £todo rename ownerCard prop 
     */
    function payCardPrefund (uint256 missingAccountFunds, address originalSender, address ownerCard) external onlyCardHolder(ownerCard) noBlockedCard returns (bool success) {
        // check if the call origninated from the entrypoint. 
        if (originalSender != address(_entryPoint)) { 
            revert LoyaltyProgram__OnlyEntryPoint(); 
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

    /**
     @notice increases the s_nonce by a given amount. 
     Allows for efficient creation of unique loyalty point vouchers.  
     */
    function increaseNonce(uint256 _increase) public onlyOwner {
        if (_increase > MAX_INCREASE_NONCE) {
            revert LoyaltyProgram__MoreThanMaxIncrease(); 
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
    function _getLoyaltyCard(address owner, uint256 salt) internal returns (LoyaltyCard newCard) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return LoyaltyCard(payable(addr));
        }
        if (!s_allowCreationCards) {
            revert LoyaltyProgram__NotRegisteredCard(); 
        }
        newCard = LoyaltyCard(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(cardImplementation),
                abi.encodeCall(LoyaltyCard.initialize, (owner))
            )));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function _addDepositCard(address _card, uint256 _value) internal {
        entryPoint().depositTo{value: _value}(_card);
    }

    function _update(address from, address to, uint256 value) internal override (ERC20) {
        super._update(from, to, value); 
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
    function getAddress(address owner,uint256 salt) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(cardImplementation),
                    abi.encodeCall(LoyaltyCard.initialize, (owner))
                )
            )));
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
                keccak256(bytes("RedeemGift(address program,address owner,address gift,uint256 giftId)")),
                message.program,
                message.owner,
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165)
        returns (bool)
    {
        return 
            interfaceId == type(ILoyaltyProgram).interfaceId || 
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
