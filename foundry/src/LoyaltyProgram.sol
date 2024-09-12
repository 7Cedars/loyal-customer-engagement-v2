// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165.sol";
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol"; // check use after refactor
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol"; // check use after refactor

// eth-infinitism imports //
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports //
import {LoyaltyCard} from "./LoyaltyCard.sol";
import {LoyaltyGift} from "./LoyaltyGift.sol";
import {FactoryCards} from "./FactoryCards.sol";
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

contract LoyaltyProgram is ERC165, ERC20, Ownable, ILoyaltyProgram {
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
    error LoyaltyProgram__NotRegisteredCard();
    error LoyaltyProgram__IncorrectInterface(address gift);
    error LoyaltyProgram__BlockedLoyaltyCard();
    error LoyaltyProgram__AlreadyExecuted();
    error LoyaltyProgram__RequestNotFromProgramOwner();
    error LoyaltyProgram__NotSignedByOwner();
    error LoyaltyProgram__CardDoesNotOwnGift();
    error LoyaltyProgram__GiftExchangeFailed();
    error LoyaltyProgram__OnlyEntryPoint();

    //////////////////////////////////////////////////////////////////
    //                   Type declarations                          //
    //////////////////////////////////////////////////////////////////

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
        uint256 uniqueNumber; // this can be any number - as long as it makes the request (and its signature) unique.
    }

    // giftToRedeem message struct
    struct GiftToRedeem {
        address program;
        address owner; // = owner loyalty card.
        address gift;
        uint256 giftId;
        uint256 uniqueNumber; // this can be any number - as long as it makes the request (and its signature) unique.
    }

    // giftToRedeem message struct
    struct AllowedGift {
        bool redeemable;
        bool exchangeable;
    }

    //////////////////////////////////////////////////////////////////
    //                    State variables                           //
    //////////////////////////////////////////////////////////////////
    mapping(address => AllowedGift) public allowedGifts;
    address[] public exchangableGifts;
    address[] public redeemableGifts;

    mapping(bytes => bool) public s_executed; // combines RequestPoints and giftToRedeem hashes.
    mapping(address => bool) private _blockedCards;

    string public imageUri;
    bool public allowCreationCards = true;

    RequestPoints private requestPoints;
    GiftToRedeem private giftToRedeem;

    bytes32 private immutable DOMAIN_SEPARATOR;
    address public immutable ENTRY_POINT;
    address public immutable CARD_FACTORY;

    uint256 private constant MAX_INCREASE_NONCE = 100;
    uint256 private constant LOYALTY_PROGRAM_VERSION = 2;
    uint256 private constant SALT = 123456;

    //////////////////////////////////////////////////////////////////
    //                          Events                              //
    //////////////////////////////////////////////////////////////////
    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed owner, address indexed program, uint256 indexed version);
    event ExchangeableGiftSet(address indexed loyaltyGift, bool indexed exchangeable);
    event RedeemableGiftSet(address indexed loyaltyGift, bool indexed redeemable);
    event LoyaltyPointsExchangeForGift(address indexed owner, address indexed gift, uint256 indexed giftId);
    event LoyaltyGiftRedeemed(address indexed owner, address indexed gift, uint256 indexed giftId);
    event LoyaltyCardBlocked(address indexed owner, bool indexed blocked);
    event CreationCardsAllowed(bool indexed allowed);
    event GiftsMinted(address indexed gift, uint256 indexed amount);
    event ColourSchemeChanged(bytes indexed base, bytes indexed accent);
    event ImageUriChanged();

    //////////////////////////////////////////////////////////////////
    //                        Modifiers                             //
    //////////////////////////////////////////////////////////////////
    modifier onlyCardHolder(address caller) {
        address addr = FactoryCards(CARD_FACTORY).getAddress(caller, payable(address(this)), SALT);
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
     * £todo: natspec
     */
    constructor(
        string memory name,
        string memory colourScheme, // in the format of: '#111111;#ffffff'
        string memory cardImageUri,
        address entryPoint,
        address cardsFactory
    ) ERC20(name, colourScheme) Ownable(msg.sender) noZeroAddress(entryPoint) noZeroAddress(cardsFactory) {
        _mint(address(this), type(uint256).max);

        imageUri = cardImageUri;
        ENTRY_POINT = entryPoint;
        CARD_FACTORY = cardsFactory;

        DOMAIN_SEPARATOR = hashDomain(
            EIP712Domain({
                name: name,
                version: LOYALTY_PROGRAM_VERSION,
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );

        emit LoyaltyProgramDeployed(owner(), address(this), LOYALTY_PROGRAM_VERSION);
    }

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          //
    //////////////////////////////////////////////////////////////////

    // both these are direct copies from https://solidity-by-example.org/fallback/
    // this should transfer directly to deposit! / NO! It should go to the balance of this account!
    // only the deposits of the _loyalty cards_ need to be filled up!
    fallback() external payable {
        emit Log("fallback loyalty program", gasleft());
    }

    receive() external payable {
        emit Log("receive loyalty program", gasleft());
    }

    //////////////////////////////////////////////////////////////////
    //                          External                            //
    //////////////////////////////////////////////////////////////////
    /**
     * £todo: natspec
     *
     *     £ NB: this function is called by loyaltyCard that calls this function.
     */
    function requestPointsAndCard(
        address program,
        uint256 points,
        uint256 uniqueNumber,
        bytes memory programSignature,
        address ownerCard
    ) external {
        // filling up RequestGift struct with provided data.
        requestPoints.program = program;
        requestPoints.points = points;
        requestPoints.uniqueNumber = uniqueNumber;

        // creating digest & using it to recover loyalty program  address.
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(requestPoints));
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
        LoyaltyCard card = LoyaltyCard(payable(
            FactoryCards(CARD_FACTORY).createAccount(ownerCard, payable(address(this)), SALT)
            ));

        // 1) set executed to true & execute transfer
        s_executed[programSignature] = true;
        _update(payable(address(this)), address(card), points); // emits a transfer event
    }

    /**
     * £todo outline internal function 
     *
     *     £ NB: it is the loyaltyCard that calls this function.
     */
    function exchangePointsForGift(address gift, address owner) external onlyCardHolder(owner) {
        // CHECK
        // check if gift eexchangeable.
        if (!allowedGifts[gift].exchangeable) {
            revert LoyaltyProgram__GiftNotExchangeable();
        }

        address cardAddress = FactoryCards(CARD_FACTORY).getAddress(owner, payable(address(this)), SALT);

        // if requerements not met, this function reverts with the reason why.
        // also checks for balance on card.
        ILoyaltyGift(gift).requirementsExchangeMet(payable(cardAddress));

        // effect
        // retrieve points
        _update(cardAddress, payable(address(this)), ILoyaltyGift(gift).GIFT_COST()); // emits a transfer event

        // interact
        // £note: first time I use this function, need to properly try it out..
        // Get a tokenId owned by loyalty program.
        // if balance == 0, reverts with ERC721OutOfBoundsIndex
        uint256 giftId = ILoyaltyGift(gift).tokenOfOwnerByIndex(address(this), 0);
        ILoyaltyGift(gift).safeTransferFrom(address(this), cardAddress, giftId);

        // emit.
        emit LoyaltyPointsExchangeForGift(owner, gift, giftId);
    }

    /**
     * £todo: natspec
     *
     *     £todo outline internal function 
     *     £ NB: it is the owner of the loyalty program that calls this function.
     */
    function redeemGift(
        address program,
        address ownerCard,
        address gift,
        uint256 giftId,
        uint256 uniqueNumber,
        bytes memory signature
    ) external onlyOwner {
        // filling up RequestGift struct with provided data.
        giftToRedeem.program = program;
        giftToRedeem.owner = ownerCard;
        giftToRedeem.gift = gift;
        giftToRedeem.giftId = giftId;
        giftToRedeem.uniqueNumber = uniqueNumber;

        // creating digest & using it to recover loyalty program  address.
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRedeemGift(giftToRedeem));
        address signer = digest.recover(signature);

        // CHECK.
        // Check that digest has not already been executed.
        if (s_executed[signature]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // Check if signer is loyalty card.
        if (signer != ownerCard) {
            revert LoyaltyProgram__NotSignedByOwner();
        }

        // check if request comes from registered loyalty card
        address cardAddress = FactoryCards(CARD_FACTORY).getAddress(ownerCard, payable(address(this)), SALT);
        uint256 codeSize = cardAddress.code.length;
        if (codeSize == 0) {
            revert LoyaltyProgram__NotRegisteredCard();
        }

        // check if gift is redeemable.
        if (!allowedGifts[gift].redeemable) {
            revert LoyaltyProgram__GiftNotRedeemable();
        }

        // Check if loyalty card owns the gift to be redeemed.
        if (ILoyaltyGift(gift).ownerOf(giftId) != cardAddress) {
            revert LoyaltyProgram__CardDoesNotOwnGift();
        }

        // Check if requirements for redeem are met.
        // if requerements not met, this function reverts with the reason why.
        ILoyaltyGift(gift).requirementsRedeemMet(payable(cardAddress));

        // EFFECT
        // 1) set executed to true
        s_executed[signature] = true;

        // INTERACT
        ILoyaltyGift(gift).retrieveGiftFromCard(cardAddress, giftId);

        emit LoyaltyGiftRedeemed(ownerCard, gift, giftId);
    }

    /**
     * £todo: natspec
     */
    function mintGifts(address gift, uint256 amount) external onlyOwner {
        if (!ERC165Checker.supportsInterface(gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(gift);
        }
        // Note: no other checks. The owner of the loyalty program can mint gifts that are not exchangeable and/or redeemable.
        // this is _very_ inefficient / expensive...
        for (uint256 i; i < amount; i++) {
            LoyaltyGift(gift).safeMint();
        }
        emit GiftsMinted(gift, amount);
    }

    /**
     * £todo: natspec
     */
    function setExchangeableGift(address gift, bool exchangeable) external onlyOwner {
        if (!ERC165Checker.supportsInterface(gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(gift);
        }
        if (exchangeable == false) {
            // £todo remove item from exchangableGifts.
        }
        if (exchangeable == true) {
            // £todo add item from exchangableGifts.
        }

        allowedGifts[gift].exchangeable = exchangeable;

        emit ExchangeableGiftSet(gift, exchangeable);
    }

    /**
     * £todo: natspec
     */
    function setRedeemableGift(address gift, bool redeemable) external onlyOwner {
        if (!ERC165Checker.supportsInterface(gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(gift);
        }
        if (redeemable == false) {
            // £todo remove item from exchangableGifts.
        }
        if (redeemable == true) {
            // £todo add item from exchangableGifts.
        }

        allowedGifts[gift].redeemable = redeemable;

        emit RedeemableGiftSet(gift, redeemable);
    }

    /**
     * £todo: natspec
     */
    function setCardBlocked(address owner, bool blocked) external onlyOwner {
        address cardAddress = FactoryCards(CARD_FACTORY).getAddress(owner, payable(address(this)), SALT);
        _blockedCards[cardAddress] = blocked;

        emit LoyaltyCardBlocked(owner, blocked);
    }

    /**
     * £todo: natspec
     */
    function setAllowCreationCards(bool allowed) external onlyOwner {
        allowCreationCards = allowed;

        emit CreationCardsAllowed(allowed);
    }

    /**
     * £todo: natspec
     */
    function setImageUri(string memory imageUri) external onlyOwner {
        imageUri = imageUri;

        emit ImageUriChanged(); // £note to self: cannot save string as is in event. it's hex is of no use.
    }

    /**
     * @notice the loyalty program pays for all transactions of its loyalty card - without any checks. 
     *  // this is only possible because the transactions of the loyalty cards are highly restricted. 
     *  // only 'pre-approved' transactions are allowed. 
     *  // £todo rename ownerCard prop 
     *  // msg.sender = loyalty card
     */
    function payCardPrefund(uint256 missingAccountFunds, address originalSender)
        external
        noBlockedCard
        returns (bool success)
    {
        // check if the call origninated from the entrypoint.
        if (originalSender != ENTRY_POINT) {
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
    function transfer(address to, uint256 value) public override(ERC20, IERC20) onlyOwner returns (bool) {
        (bool success) = super.transfer(to, value);
        return success;
    }

    //////////////////////////////////////////////////////////////////
    //                          Internal                           //
    //////////////////////////////////////////////////////////////////

    /**
     * deposit more funds for this account in the entryPoint
     */
    function _addDepositCard(address _card, uint256 _value) internal {
        IEntryPoint(ENTRY_POINT).depositTo{value: _value}(_card);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) {
        super._update(from, to, value);
    }

    //////////////////////////////////////////////////////////////////
    //                          Private                             //
    //////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////
    //                 View & Pure functions                        //
    //////////////////////////////////////////////////////////////////

    /**
     * £todo add natspec
     */
    function entryPoint() public view returns (IEntryPoint) {
        return IEntryPoint(ENTRY_POINT);
    }

    /**
     * £todo add natspec
     */
    function getExchangableGifts() external view returns (address[] memory exchangableGifts) {
        return exchangableGifts;
    }

    /**
     * £todo add natspec
     */
    function getRedeemableGifts() external view returns (address[] memory redeemableGifts) {
        return redeemableGifts;
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
                keccak256(bytes("RequestPoints(address program,uint256 points,uint256 uniqueNumber)")),
                message.program,
                message.points,
                message.uniqueNumber
            )
        );
    }

    /**
     * @notice helper function to create digest hash from giftToRedeem struct.
     */
    function hashRedeemGift(GiftToRedeem memory message) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(
                    bytes("redeemGift(address program,address owner,address gift,uint256 giftId,uint256 uniqueNumber)")
                ),
                message.program,
                message.owner,
                message.gift,
                message.giftId,
                message.uniqueNumber
            )
        );
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(ILoyaltyProgram).interfaceId || super.supportsInterface(interfaceId);
    }
}

//////////////////////////////////////////////////////////////////
//                      Acknowledgements                        //
//////////////////////////////////////////////////////////////////

/**
 * - Patrick Collins & Cyfrin 
 *         - solidity by example
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
