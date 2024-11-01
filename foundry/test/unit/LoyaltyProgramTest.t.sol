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
    string public constant LOYALTY_PROGRAM_VERSION = "alpha.2"; 
    uint256 private constant SALT = 123456; 

    /* Events */
    event Log(string func, uint256 gas);
    event LoyaltyProgramDeployed(address indexed s_owner, address indexed loyaltyProgramAddress);
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
                // version: LOYALTY_PROGRAM_VERSION,
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
      // console2.logBytes32(digest);

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
                // version: LOYALTY_PROGRAM_VERSION,
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
      // console2.logBytes32(digest);

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
        customerAddress, 
        requestPointsVoucher.signature 
      ); 

      _; 
    }

    modifier giveCustomerCardPointsAndGift(address customer)  {
      LoyaltyCard loyaltyCard = factoryCards.createAccount(customer, payable(address(loyaltyProgram)), SALT);
      uint256 amountGifts = 20; 
      DOMAIN_SEPARATOR =_hashDomain(
            EIP712Domain({
                name: "Highstreet Hopes",
                // version: LOYALTY_PROGRAM_VERSION,
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
      // console2.logBytes32(digest);

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
        customer, 
        requestPointsVoucher.signature 
      ); 

      // let loyalty project select and mint gift
      vm.startPrank(vendorAddress);
      loyaltyProgram.setAllowedGift(address(fridayFifteen), true, true);
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

      // console2.log(address(factoryCards)); 

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
        emit LoyaltyProgramDeployed(vendorAddress, address(loyaltyProgram));

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

    function testAddedGiftsAreAddedToArray() public {
      address[] memory giftArrayStart = loyaltyProgram.getAllowedGifts();
      assert(giftArrayStart.length == 0);

      vm.startPrank(vendorAddress);  
      loyaltyProgram.setAllowedGift(address(fridayFifteen), true, true);
      // loyaltyProgram.setAllowedGift(address(fridayFifteen), false, false);
      vm.stopPrank(); 

      // address giftEnd = loyaltyProgram.allowedGiftsArray(0);

      address[] memory giftArrayEnd = loyaltyProgram.getAllowedGifts();
      assert(giftArrayEnd.length == 1);
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

    function testHashingAndSigningRequestPoints() public {
      uint256 uniqueNumber = 1; 
      uint256 points = 250; 
      uint256 burnerWalletKey = vm.envUint("BURNET_WALLET_KEY");
      address burnerWallet = vm.envAddress("BURNER_WALLET");
      // console2.log("burnerWalletKey", burnerWalletKey); 
      address programAddress = address(loyaltyProgram); //  0x0Ad4017904Acf30DD74f3A7C18D8A18fA3931686; 

      // console2.log("DOMAIN SEPRATOR DATA CONTRACT");
      // console2.log("Highstreet Hopes"); 
      // console2.logUint(block.chainid); 
      // console2.logAddress(programAddress); 

      bytes32 DOMAIN_SEPARATOR_TEMP =_hashDomain(
            EIP712Domain({
                name: "Highstreet Hopes",
                chainId: block.chainid, 
                verifyingContract: programAddress
            })
        );
      // console2.log("DOMAIN_SEPARATOR_TEMP in TEST"); 
      // console2.logBytes32(DOMAIN_SEPARATOR_TEMP); 
      
      // loyalty program owner creates voucher for 5000 points. 
      PointsToRequest memory message = PointsToRequest({
          program: programAddress,
          points: points, 
          uniqueNumber: uniqueNumber
      });

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR_TEMP, hashPointsToRequest(message));
      // console2.log("DIGEST IN TEST"); 
      // console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(burnerWalletKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);

      // console2.logBytes(signature); 

      // transferring ownership of program to burnetWallet
      vm.prank(vendorAddress); 
      loyaltyProgram.transferOwnership(burnerWallet);
      // console2.log("ownerProgram", loyaltyProgram.owner()); 

      loyaltyProgram.requestPoints({
        program: programAddress,
        points: points,
        uniqueNumber: uniqueNumber,
        ownerCard: burnerWallet, 
        programSignature: signature
      }); 
    } 

    ///////////////////////////////////////////////////////////////////////////
    //                   Test Function ExchangePointsForGift                 //
    ///////////////////////////////////////////////////////////////////////////

    function testExchangePointsForGift() public giveCustomerCardAndPoints(customerAddress) {
      LoyaltyCard loyaltyCard = factoryCards.createAccount(customerAddress, payable(address(loyaltyProgram)), SALT);
      uint256 amountGifts = 20; 
      uint256 balanceCardBefore = loyaltyProgram.balanceOf(address(loyaltyCard));
      uint256 giftCost = fridayFifteen.GIFT_COST();
      
      vm.startPrank(vendorAddress);
      loyaltyProgram.setAllowedGift(address(fridayFifteen), true, true);
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

      vm.warp(1726840800); // = Tuesday 24 sept 2024. 
      
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
      // console2.logBytes32(digest);

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

      // vendor get the signature and calls redeem gift. 
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

    // Testing for a bug in front end. 
    function testRetrievalAddressVoucher() public  {
      bytes32 DOMAIN_SEPARATOR_TEMP = _hashDomain(
      EIP712Domain({
            name: "test2",
            // version: LOYALTY_PROGRAM_VERSION,
            chainId: 11155420,
            verifyingContract: 0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d
        })
      );
      
      // customer owner creates & signs request to redeem gift. 
      GiftToRedeem memory giftToRedeem = GiftToRedeem({
          program: // 0xf673c7af9aed0244512b3fca084a235b9eb4464d,
                      0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d, 
          owner: // 0xc5aace2527d6503c75d893a4bb824e5585398618,
                    0xC5aAcE2527d6503c75D893A4bb824e5585398618 , 
          gift: //0x135f2f30aaef9579efd0615e723c0036dbd9035a, 
                  0x135f2F30aaEf9579EFd0615E723C0036dbd9035a,
          giftId: 25, 
          uniqueNumber: 368377109246287 
      });
      bytes memory signature = hex"7779e7a700f4df149d33640786bc51fbdac49aa244dffd3cf8b800f3bebcd94f591aeffe4dfa7e36af700264744731546d8365c16b11c77bd7daca4ca1e82f1e1b"; 

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR_TEMP, hashRedeemGift(giftToRedeem));
      address signer = digest.recover(signature);
      console2.logAddress(signer);  

    }

      struct GiftToRedeemTemp {
        address program;
        address owner; // = owner loyalty card.
        address gift;
        uint256 giftId;
        uint256 uniqueNumber; // this can be any number - as long as it makes the request (and its signature) unique.
      }

    function testSigningPrivyGiftToRedeem() public  {
      bytes32 DOMAIN_SEPARATOR_TEMP = _hashDomain(
        EIP712Domain({
              name: "test2",
              // version: LOYALTY_PROGRAM_VERSION,
              chainId: 11155420,
              verifyingContract: 0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d
          })
      );
      uint256 privyKey = vm.envUint("PRIVY_BURNER_WALLET_KEY");
      address privyAddress = vm.addr(privyKey);
      console2.logAddress(privyAddress);  

      // customer owner creates & signs request to redeem gift. 
      GiftToRedeemTemp memory giftToRedeem = GiftToRedeemTemp({
          program: // 0xf673c7af9aed0244512b3fca084a235b9eb4464d,
                      0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d,
          owner: // 0xc5aace2527d6503c75d893a4bb824e5585398618,
                    0xC5aAcE2527d6503c75D893A4bb824e5585398618, 
          gift: //0x135f2f30aaef9579efd0615e723c0036dbd9035a, 
                  0x135f2F30aaEf9579EFd0615E723C0036dbd9035a,
          giftId: 25,
          uniqueNumber: 878794630064237 
      });

      bytes32 hashTemp = 
          keccak256(
            abi.encode(
                keccak256("redeemGift(address program,address owner,address gift,uint256 giftId,uint256 uniqueNumber)"),
                giftToRedeem.program,
                giftToRedeem.owner,
                giftToRedeem.gift,
                giftToRedeem.giftId,
                giftToRedeem.uniqueNumber
            )
        );

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR_TEMP, hashTemp);
      // console2.logBytes32(digest);

      (uint8 v, bytes32 r, bytes32 s) = vm.sign(privyKey, digest);
      bytes memory signature = abi.encodePacked(r, s, v);
      console2.logBytes(signature); 
  
    }

    // Testing for a bug in front end. 
    function testRetrievalAddressPoints() public {


    console2.logAddress(vendorAddress);
      

      bytes32 DOMAIN_SEPARATOR_TEMP = _hashDomain(
            EIP712Domain({
                name: "test2",
                // version: LOYALTY_PROGRAM_VERSION,
                chainId: 11155420,
                verifyingContract: 0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d
            })
        );

      // customer owner creates & signs request to redeem gift. 
      PointsToRequest memory pointsToRequest = PointsToRequest({
          program: 0xf673c7aF9aED0244512B3fCA084a235B9Eb4464d, 
          points: 500, 
          uniqueNumber: 1151308709814906
      });
      bytes memory signature = hex"aa9466bcd1bd4f1c5dcde1efeaeb9749840b35cd61b629788b6a8ad0530a77fd64b4d996530743a66b1c81b22d75c412421b68aa8f8f6f932579410e197b3cdf1b"; 

      // vender signs the voucher
      bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR_TEMP, hashPointsToRequest(pointsToRequest));
      address signer = digest.recover(signature);
      console2.logAddress(signer);  

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
