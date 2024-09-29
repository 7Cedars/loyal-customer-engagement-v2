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

// FOR TESTING ONLY // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

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
    error LoyaltyProgram__GiftAddressAndArrayDoNotAlign(); 
    error LoyaltyProgram__GiftAlreadySet(); 

    //////////////////////////////////////////////////////////////////
    //                   Type declarations                          //
    //////////////////////////////////////////////////////////////////

    // EIP712 domain separator
    struct EIP712Domain {
        string name;
        uint256 chainId;
        address verifyingContract;
    }

    // pointsToRequest message struct
    struct PointsToRequest {
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
    address[] public allowedGiftsArray; // needed for quick retrieval gifts linked to program. 

    mapping(bytes => bool) public s_executed; // combines RequestPoints and giftToRedeem hashes.
    mapping(address => bool) private _blockedCards;

    string public imageUri;
    bool public allowCreationCards = true;

    PointsToRequest private pointsToRequest;
    GiftToRedeem private giftToRedeem;

    bytes32 private immutable DOMAIN_SEPARATOR;
    address public immutable ENTRY_POINT;
    address public immutable CARD_FACTORY;

    uint256 private constant MAX_INCREASE_NONCE = 100;
    uint256 private constant SALT = 123456;

    //////////////////////////////////////////////////////////////////
    //                          Events                              //
    //////////////////////////////////////////////////////////////////
    event Log(address indexed sender, uint256 indexed value, string func);
    event LoyaltyProgramDeployed(address indexed owner, address indexed program);
    event AllowedGiftSet(address indexed loyaltyGift, bool indexed exchangeable, bool indexed redeemable);
    event LoyaltyPointsExchangeForGift(address indexed customer, address indexed gift, uint256 indexed giftId);
    event LoyaltyGiftRedeemed(address indexed customer, address indexed gift, uint256 indexed giftId);
    event LoyaltyCardBlocked(address indexed customer, bool indexed blocked);
    event CreationCardsAllowed(bool indexed allowed);
    event GiftsMinted(address indexed gift, uint256 indexed amount);
    event GiftTransferred(address indexed to, address indexed gift, uint256 indexed giftId); 
    event ImageUriChanged();

    //////////////////////////////////////////////////////////////////
    //                        Modifiers                             //
    //////////////////////////////////////////////////////////////////
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
        address owner, 
        address entryPoint,
        address cardsFactory
    ) ERC20(name, colourScheme) Ownable(owner) noZeroAddress(entryPoint) noZeroAddress(cardsFactory) {
        _mint(address(this), type(uint256).max);

        imageUri = cardImageUri;
        ENTRY_POINT = entryPoint;
        CARD_FACTORY = cardsFactory;

        DOMAIN_SEPARATOR = hashDomain(
            EIP712Domain({
                name: name,
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );

        emit LoyaltyProgramDeployed(owner, address(this)); // NB -- here something is wrong! 
    }

    //////////////////////////////////////////////////////////////////
    //                  Receive & Fallback                          //
    //////////////////////////////////////////////////////////////////

    // both these are direct copies from https://solidity-by-example.org/fallback/
    // this should transfer directly to deposit! / NO! It should go to the balance of this account!
    // only the deposits of the _loyalty cards_ need to be filled up!
    fallback() external payable {
        emit Log(msg.sender, msg.value,"fallback");
    }

    receive() external payable {
        emit Log(msg.sender, msg.value, "receive");
    }

    //////////////////////////////////////////////////////////////////
    //                          External                            //
    //////////////////////////////////////////////////////////////////
    /**
     * £todo: natspec
     *
     *     £ NB: this function is called by loyaltyCard that calls this function.
     * Note: points are ALWAYS transferred to a loyalty card!  
     */
    function requestPoints(
        address program,
        uint256 points,
        uint256 uniqueNumber,
        address ownerCard, 
        bytes memory programSignature
    ) external {
        // filling up RequestGift struct with provided data.
        pointsToRequest.program = program;
        pointsToRequest.points = points;
        pointsToRequest.uniqueNumber = uniqueNumber;

        // creating digest & using it to recover loyalty program  address.
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashPointsToRequest(pointsToRequest));
        console2.log("DIGEST IN CONTRACT"); 
        console2.logBytes32(digest); 
        
        address signer = digest.recover(programSignature);

        // Checks.
        if (signer != owner()) {
            revert LoyaltyProgram__RequestNotFromProgramOwner();
        }

        // £todo: need additional check that program == address(this)? 

        // Check that digest has not already been executed.
        if (s_executed[programSignature]) {
            revert LoyaltyProgram__AlreadyExecuted();
        }

        // if get address of loyalty card (note that with on the first transfer, the entryPoint initialises a card).
        address cardAddress = FactoryCards(CARD_FACTORY).getAddress(ownerCard, payable(address(this)), SALT); 

        // set executed to true & execute transfer
        s_executed[programSignature] = true;
        _update(payable(address(this)), cardAddress, points); // emits a transfer event
    }

    /**
     * £todo outline internal function 
     *
     *     £ NB: it is the loyaltyCard that calls this function.
     */
    function exchangePointsForGift(address gift, address caller) external {
        // CHECK
        // check if caller owns loyalty card
        address cardAddress = FactoryCards(CARD_FACTORY).getAddress(caller, payable(address(this)), SALT);
        uint256 codeSize = cardAddress.code.length;
        if (codeSize == 0) {
            revert LoyaltyProgram__OnlyCardHolder();
        }

        // check if gift eexchangeable.
        if (!allowedGifts[gift].exchangeable) {
            revert LoyaltyProgram__GiftNotExchangeable();
        }

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
        emit LoyaltyPointsExchangeForGift(caller, gift, giftId);
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
     * note: only the owner can directly transfer a gift to another address. 
     */
    function transferGift(address customer, address gift, uint256 giftId) external onlyOwner {
        address to = FactoryCards(CARD_FACTORY).getAddress(customer, payable(address(this)), SALT);
        uint256 codeSize = to.code.length;
        if (codeSize == 0) {
            revert LoyaltyProgram__OnlyCardHolder();
        }
        if (!ERC165Checker.supportsInterface(gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(gift);
        }
        LoyaltyGift(gift).transferGift(to, giftId);

        emit GiftTransferred(to, gift, giftId);
    }


    /**
     * £todo: natspec
     Note: this function is not called very often. But the array of gifts _is_ called very often 
     So the inefficiency (and complexity) of using an array in addition to the mapping is accepted.  
     Note: if deleting or updating a gift, index of non-zero is needed. 
     Note: index of 0 implies that it is a newly allowed gift. 
     */
    function setAllowedGift(address gift, bool exchangeable, bool redeemable) external onlyOwner {
        // checks 
        if (!ERC165Checker.supportsInterface(gift, type(ILoyaltyGift).interfaceId)) {
            revert LoyaltyProgram__IncorrectInterface(gift);
        }
        if (
            allowedGifts[gift].redeemable == redeemable && 
            allowedGifts[gift].exchangeable == exchangeable 
            ) {
            revert LoyaltyProgram__GiftAlreadySet();
        }
        // note: a gift is only added to the array when BOTH exchangeable and redeemable are set to true.
        if (exchangeable == true && redeemable == true) {
            allowedGiftsArray.push(gift); 
        }
        // this is really quite expensive. 
        if (exchangeable == false && redeemable == false) {
            for (uint256 i; i < allowedGiftsArray.length; i++) {
                if (allowedGiftsArray[i] == gift) {
                    allowedGiftsArray[i] = allowedGiftsArray[allowedGiftsArray.length - 1];
                    allowedGiftsArray.pop();
                }
            }
        }
        // updating the allowedGifts mapping.
        allowedGifts[gift].exchangeable = exchangeable;
        allowedGifts[gift].redeemable = redeemable;

        emit AllowedGiftSet(gift, exchangeable, redeemable);
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
    //                          Internal                           //
    //////////////////////////////////////////////////////////////////

    /**
     * deposit more funds for this account in the entryPoint
     */
    function _addDepositCard(address _card, uint256 _value) internal {
        IEntryPoint(ENTRY_POINT).depositTo{value: _value}(_card);
    }

    // function _update(address from, address to, uint256 value) internal override(ERC20) {
    //     super._update(from, to, value);
    // }

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
    function getAllowedGifts() external view returns (address[] memory allowedGifts) {
        return allowedGiftsArray;
    }

    /**
     * @notice helper function to create EIP712 Domain separator.
     */
    function hashDomain(EIP712Domain memory domain) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(domain.name)),
                domain.chainId,
                domain.verifyingContract
            )
        );
    }

    /**
     * @notice helper function to create digest hash from pointsToRequest struct.
     */
    function hashPointsToRequest(PointsToRequest memory message) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(bytes("PointsToRequest(address program,uint256 points,uint256 uniqueNumber)")),
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
