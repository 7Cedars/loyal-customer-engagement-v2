// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

// openZeppelin imports 
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports // 
import {LoyaltyProgram} from "../../src/LoyaltyProgram.sol";
import {FactoryPrograms} from "../../src/FactoryPrograms.sol";
import {LoyaltyCard} from  "../../src/LoyaltyCard.sol";
import {FactoryCards} from  "../../src/FactoryCards.sol";
import {FridayFifteen} from "../../src/sample-gifts/FridayFifteen.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployFactoryPrograms} from "../../script/DeployFactoryPrograms.s.sol";
import {DeployFridayFifteen} from "../../script/DeployLoyaltyGifts.s.sol";

contract LoyaltyProgramTest is Test {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /* errors */
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

    /* Type declarations */
    FactoryPrograms factoryPrograms; 
    LoyaltyProgram loyaltyProgram; 
    HelperConfig helperConfig;
    FridayFifteen fridayFifteen; 
    HelperConfig.NetworkConfig config; 
    FactoryCards factoryCards; 
    address ownerProgram; 
    bytes32 internal DOMAIN_SEPARATOR; 

    // EIP712 domain separator
    struct EIP712Domain {
        string name;
        uint256 version;
        uint256 chainId;
        address verifyingContract;
    }

    // PointsToRequestmessage struct
    struct PointsToRequest {
        address program;
        uint256 points;
        uint256 uniqueNumber;
    }

    struct RequestPointsVoucher {
        address program;
        uint256 points;
        uint256 uniqueNumber;
        bytes signature; 
    }
    RequestPointsVoucher requestPointsVoucher; 

    // RedeemGift message struct
   struct GiftToRedeem {
        address program;
        address owner; // = owner loyalty card.
        address gift;
        uint256 giftId;
        uint256 uniqueNumber; // this can be any number - as long as it makes the request (and its signature) unique.
    }

    struct RedeemGiftRequest {
        address program;
        address owner;
        address gift;
        uint256 giftId;
        uint256 uniqueNumber;
        bytes signature; 
    }
    RedeemGiftRequest requestRedeemGift; 

    /* State variables */
    uint256 vendorKey = vm.envUint("DEFAULT_ANVIL_KEY_0");
    address vendorAddress = vm.addr(vendorKey);
    uint256 customerKey = vm.envUint("DEFAULT_ANVIL_KEY_1");
    address customerAddress = vm.addr(customerKey);
    uint256 customerKey2 = vm.envUint("DEFAULT_ANVIL_KEY_2");
    address customerAddress2 = vm.addr(customerKey2);
    uint256 uniqueNumber = 3; 

    LoyaltyCard public cardImplementation;
    uint256 private constant LOYALTY_PROGRAM_VERSION = 2; 
    uint256 private constant SALT = 123456; 

    /* Events */
    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed s_owner, address indexed loyaltyProgramAddress, uint256 indexed LOYALTY_PROGRAM_VERSION);
    event LoyaltyGiftAdded(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerExchangable(address indexed loyaltyGift);
    event LoyaltyGiftNoLongerRedeemable(address indexed loyaltyGift);
    event LoyaltyPointsTransferred(address indexed card, uint256 indexed points); 
    event LoyaltyPointsExchangeForGift(address indexed card, address indexed _gift, uint256 indexed giftId); 
    event LoyaltyGiftRedeemed(address indexed card, address indexed gift, uint256 indexed giftId); 
    event LoyaltyCardCreated(address indexed entryPoint, address indexed owner, address indexed loyaltyProgram);
    
    /* Modifiers */

    modifier giveVoucher5000Points(address customer) {
      DOMAIN_SEPARATOR =_hashDomain(
            EIP712Domain({
                name: "Highstreet Hopes",
                version: LOYALTY_PROGRAM_VERSION,
                chainId: block.chainid,
                verifyingContract: address(loyaltyProgram)
            })
        );
      uint256 points = 5000; 
       
        
      // loyalty program owner creates voucher for 5000 points. 
      PointsToRequest memory message = PointsToRequest({
          program: address(loyaltyProgram),
          points: points,
          uniqueNumber: uniqueNumber
      });

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashPointsToRequest(message));
      console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(vendorKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);

      requestPointsVoucher = RequestPointsVoucher({
        program: address(loyaltyProgram),
        points: points,
        uniqueNumber: uniqueNumber,  
        signature: signature
      }); 

      _; 
    }

    modifier giveCustomerCardAndPoints(address customer) {
      DOMAIN_SEPARATOR =_hashDomain(
            EIP712Domain({
                name: "Highstreet Hopes",
                version: LOYALTY_PROGRAM_VERSION,
                chainId: block.chainid,
                verifyingContract: address(loyaltyProgram)
            })
        );
      uint256 points = 5000; 
       
        
      // loyalty program owner creates voucher for 5000 points. 
      PointsToRequest memory message = PointsToRequest({
          program: address(loyaltyProgram),
          points: points, 
          uniqueNumber: uniqueNumber
      });

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashPointsToRequest(message));
      console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(vendorKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);
      
      requestPointsVoucher = RequestPointsVoucher({
        program: address(loyaltyProgram),
        points: points,
        uniqueNumber: uniqueNumber, 
        signature: signature
      }); 

      vm.prank(customer); 
      loyaltyProgram.requestPoints(
        requestPointsVoucher.program, 
        requestPointsVoucher.points, 
        requestPointsVoucher.uniqueNumber, 
        requestPointsVoucher.signature, 
        customerAddress
      ); 

      _; 
    }

    modifier giveCustomerCardPointsAndGift(address customer) {
      LoyaltyCard loyaltyCard = factoryCards.createAccount(customer, payable(address(loyaltyProgram)), SALT);
      uint256 amountGifts = 20; 
      DOMAIN_SEPARATOR =_hashDomain(
            EIP712Domain({
                name: "Highstreet Hopes",
                version: LOYALTY_PROGRAM_VERSION,
                chainId: block.chainid,
                verifyingContract: address(loyaltyProgram)
            })
        );
      uint256 points = 50000; 
       
      // loyalty program owner creates voucher for 5000 points. 
      PointsToRequest memory message = PointsToRequest({
          program: address(loyaltyProgram),
          points: points, 
          uniqueNumber: uniqueNumber
      });

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashPointsToRequest(message));
      console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(vendorKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);
      
      requestPointsVoucher = RequestPointsVoucher({
        program: address(loyaltyProgram),
        points: points,
        uniqueNumber: uniqueNumber, 
        signature: signature
      }); 

      // give customer a card with points
      vm.prank(customer); // NB!  
      loyaltyProgram.requestPoints(
        requestPointsVoucher.program, 
        requestPointsVoucher.points, 
        requestPointsVoucher.uniqueNumber, 
        requestPointsVoucher.signature, 
        customer
      ); 

      // let loyalty project select and mint gift
      vm.startPrank(vendorAddress);
      loyaltyProgram.setAllowedGift(address(fridayFifteen), 0, true, true);
      loyaltyProgram.mintGifts(address(fridayFifteen), amountGifts);
      vm.stopPrank(); 
      
      // customer exchanges points for gift. 
      vm.prank(customer); 

      // this crashes. 
      loyaltyCard.execute(
        address(loyaltyProgram), 0, abi.encodeCall(
          LoyaltyProgram.exchangePointsForGift, (address(fridayFifteen), customer)
      ));

      _; 
    }


    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////

    function setUp() external {
      string memory name = "Highstreet Hopes";
      string memory colourScheme = '#3d5769;#c8cf0c'; 
      string memory cardImageUri = "";

      DeployFactoryPrograms deployer = new DeployFactoryPrograms();
      (factoryPrograms, factoryCards, helperConfig) = deployer.run();
      config = helperConfig.getConfig();
      // factoryCards = FactoryCards(config.factoryCards);  

      console2.log(address(factoryCards)); 

      loyaltyProgram = factoryPrograms.deployLoyaltyProgram(
        name, 
        colourScheme, 
        cardImageUri
      );
      
      DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
      fridayFifteen = deployerFridayFifteen.run();
      
      ownerProgram = loyaltyProgram.owner();
      vm.prank(ownerProgram); 
      loyaltyProgram.transferOwnership(vendorAddress);
    }

    function testLoyaltyProgramHasOwner() public view {
        assertNotEq(address(0), ownerProgram);
    }

    function testLoyaltyProgramCanChangeOwner() public {
        // £todo
    }
    
    function testDeployEmitsevent() public {
        string memory name = "Highstreet Hopes";
        string memory colourScheme = '#3d5769;#c8cf0c'; 
        string memory cardImageUri = "";

        vm.expectEmit(true, false, false, false);
        emit LoyaltyProgramDeployed(vendorAddress, address(loyaltyProgram), LOYALTY_PROGRAM_VERSION);

        vm.prank(vendorAddress);
        loyaltyProgram = new LoyaltyProgram(
            name, 
            colourScheme, 
            cardImageUri,
            vendorAddress, 
            config.entryPoint, 
            address(factoryCards)
        );
    }

    function testAddingLoyaltyGiftEmitsEvent() public {
        // £todo
    }

    function testAddingLoyaltyGiftFailsIfNotGiftContract() public {
        // £todo
    }

    function testRemovingExchangeLoyaltyGiftEmitsEvent() public {
        // £todo
    }

    function testRemovingRedeemLoyaltyGiftEmitsEvent() public {
        // £todo
    }

    function testEmitsEventWhenCardIsBlocked() public {
        // £todo
    }

    function testEmitsEventWhenCardUnblocked() public {
        // £todo
    }


    function testLoyaltyProgramCanReceiveEth() public {
      uint256 transferAmount = 1 ether; 
      uint256 balanceStart = address(loyaltyProgram).balance;  
      vm.deal(vendorAddress, transferAmount);
      
      vm.prank(vendorAddress);
      address(loyaltyProgram).call{value: transferAmount}("");  
      
      uint256 balanceEnd = address(loyaltyProgram).balance;
      vm.assertEq(balanceStart + transferAmount, balanceEnd); 
    }

    ///////////////////////////////////////////////////////////////////////////
    //                    Test Function requestPoints                        //
    ///////////////////////////////////////////////////////////////////////////

    // £todo 

    ///////////////////////////////////////////////////////////////////////////
    //                   Test Function ExchangePointsForGift                 //
    ///////////////////////////////////////////////////////////////////////////

    function testExchangePointsForGift() public giveCustomerCardAndPoints(customerAddress) {
      LoyaltyCard loyaltyCard = factoryCards.createAccount(customerAddress, payable(address(loyaltyProgram)), SALT);
      uint256 amountGifts = 20; 
      uint256 balanceCardBefore = loyaltyProgram.balanceOf(address(loyaltyCard));
      uint256 giftCost = fridayFifteen.GIFT_COST();
      
      vm.startPrank(vendorAddress);
      loyaltyProgram.setAllowedGift(address(fridayFifteen), 0, true, true);
      loyaltyProgram.mintGifts(address(fridayFifteen), amountGifts);
      vm.stopPrank(); 
      
      // note: this is the ay I should test. as close as possible to AA implementation. 
      vm.prank(customerAddress); // even better would be address(entryPonint) 
      loyaltyCard.execute(
        address(loyaltyProgram), 0, abi.encodeCall(
          LoyaltyProgram.exchangePointsForGift, (address(fridayFifteen), customerAddress)
        ));
      uint256 balanceCardAfter = loyaltyProgram.balanceOf(address(loyaltyCard));

      vm.assertEq(fridayFifteen.balanceOf(address(loyaltyProgram)), amountGifts - 1); 
      vm.assertEq(fridayFifteen.balanceOf(address(loyaltyCard)), 1);
      vm.assertEq(balanceCardBefore, balanceCardAfter + giftCost); 
    }

    // £todo test if all the checks work on 


    ///////////////////////////////////////////////////////////////////////////
    //                          Test Function RedeemGift                     //
    ///////////////////////////////////////////////////////////////////////////


    function testRedeemGift() public giveCustomerCardPointsAndGift(customerAddress) {
      uint256 giftId = 0; // I can also programatically search this. TBI. 
      
      // customer owner creates & signs request to redeem gift. 
      GiftToRedeem memory message = GiftToRedeem({
          program: address(loyaltyProgram),
          owner: customerAddress, 
          gift: address(fridayFifteen), 
          giftId: giftId, 
          uniqueNumber: uniqueNumber 
      });

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRedeemGift(message));
      console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(customerKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);
      
      // this info is encoded in the QR code. 
      
      requestRedeemGift = RedeemGiftRequest({
        program: address(loyaltyProgram),
        owner: customerAddress, 
        gift: address(fridayFifteen), 
        giftId: giftId,
        uniqueNumber: uniqueNumber, 
        signature: signature
      }); 

      vm.prank(vendorAddress);  
      loyaltyProgram.redeemGift(
        requestRedeemGift.program, 
        requestRedeemGift.owner,
        requestRedeemGift.gift,
        requestRedeemGift.giftId,
        requestRedeemGift.uniqueNumber,
        requestRedeemGift.signature
      ); 

    }


    ///////////////////////////////////////////////////////////////////////
    //                        Helper Functions                           //
    /////////////////////////////////////////////////////////////////////// 
    function _getAddress(address owner, address payable loyaltyProgram, uint256 salt) internal view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(cardImplementation),
                    abi.encodeCall(LoyaltyCard.initialize, (owner, loyaltyProgram))
                )
            )));
    }

    function _hashDomain(EIP712Domain memory domain) private pure returns (bytes32) {
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
}

    //////////////////////////////////////////////////////////////////
    //                          Notes to self                       // 
    //////////////////////////////////////////////////////////////////

    // When reviewing this code, check: https://github.com/transmissions11/solcurity
    // see also: https://github.com/nascentxyz/simple-security-toolkit

    // Structure contract // -- from Patrick Collins. 
    /* LOYALTY_PROGRAM_VERSION */
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
