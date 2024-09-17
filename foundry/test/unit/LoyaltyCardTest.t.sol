// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

// openZeppelin imports 
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import {calldataKeccak, min} from "lib/account-abstraction/contracts/core/Helpers.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {EntryPoint} from "lib/account-abstraction/contracts/core/EntryPoint.sol";
import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";

// local imports // 
import {SendPackedUserOp} from "../../script/SendPackedUserOp.s.sol";
import {LoyaltyProgram} from "../../src/LoyaltyProgram.sol";
import {FactoryPrograms} from "../../src/FactoryPrograms.sol";
import {LoyaltyCard} from  "../../src/LoyaltyCard.sol";
import {FactoryCards} from  "../../src/FactoryCards.sol";
import {FridayFifteen} from "../../src/sample-gifts/FridayFifteen.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployFactoryPrograms} from "../../script/DeployFactoryPrograms.s.sol";
import {DeployFridayFifteen} from "../../script/DeployLoyaltyGifts.s.sol";
import {ILoyaltyProgram} from "../../src/interfaces/ILoyaltyProgram.sol";

contract LoyaltyCardTest is Test {
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
  EntryPoint entryPoint; 
  SendPackedUserOp sendPackedUserOp;
  address ownerProgram; 
  bytes32 internal DOMAIN_SEPARATOR; 

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
  struct RedeemGift {
      address program; 
      address owner;
      address gift;
      uint256 giftId;
      uint256 uniqueNumber;
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
  address randomUser = vm.addr(123);
  uint256 uniqueNumber = 3; 
  uint256 points = 5000; 
  address constant ANVIL_DEFAULT_ACCOUNT = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; 

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
    RequestPoints memory message = RequestPoints({
        program: address(loyaltyProgram),
        points: points,
        uniqueNumber: uniqueNumber
    });

    // vender signs the voucher
    bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(message));
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
      
    // loyalty program owner creates voucher for 5000 points. 
    RequestPoints memory message = RequestPoints({
        program: address(loyaltyProgram),
        points: points, 
        uniqueNumber: uniqueNumber
    });

    // vender signs the voucher
    bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(message));
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
    loyaltyProgram.requestPointsAndCard(
      requestPointsVoucher.program, 
      requestPointsVoucher.points, 
      requestPointsVoucher.uniqueNumber, 
      requestPointsVoucher.signature, 
      customerAddress
    ); 

    _; 
  }

  modifier giveCustomerCardPointsAndGift(address customer) {
    address loyaltyCard = factoryCards.getAddress(customer, payable(address(loyaltyProgram)), SALT);
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
    RequestPoints memory message = RequestPoints({
        program: address(loyaltyProgram),
        points: points, 
        uniqueNumber: uniqueNumber
    });

    // vender signs the voucher
    bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(message));
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
    vm.prank(customer); 
    loyaltyProgram.requestPointsAndCard(
      requestPointsVoucher.program, 
      requestPointsVoucher.points, 
      requestPointsVoucher.uniqueNumber, 
      requestPointsVoucher.signature, 
      customer
    ); 

    // let loyalty project select and mint gift
    vm.startPrank(vendorAddress);
    loyaltyProgram.setExchangeableGift(address(fridayFifteen), true);
    loyaltyProgram.setRedeemableGift(address(fridayFifteen), true);
    loyaltyProgram.mintGifts(address(fridayFifteen), amountGifts);
    vm.stopPrank(); 
    
    // customer exchanges points for gift. 
    vm.prank(customer); 
    LoyaltyCard(payable(loyaltyCard)).execute(
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
    entryPoint = EntryPoint(payable(config.entryPoint)); 
    // factoryCards = FactoryCards(config.factoryCards); 
    sendPackedUserOp = new SendPackedUserOp();

    loyaltyProgram = factoryPrograms.deployLoyaltyProgram(
      name, 
      colourScheme, 
      cardImageUri
    );
    vm.deal(address(loyaltyProgram), 1 ether); 
    
    DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
    fridayFifteen = deployerFridayFifteen.run();
    
    ownerProgram = loyaltyProgram.owner();
    vm.prank(ownerProgram); 
    loyaltyProgram.transferOwnership(vendorAddress);
  }

  ///////////////////////////////////////////////
  ///                   Tests                 ///
  ///////////////////////////////////////////////

  function testEntryPointCanExecuteRequestPoints() public giveCustomerCardPointsAndGift(customerAddress) {
    address customerCardAddress = factoryCards.getAddress(customerAddress, payable(address(loyaltyProgram)), SALT);
    LoyaltyCard customerCard = LoyaltyCard(payable(customerCardAddress)); 
    uint256 gift = 0;

    // arrange
    address dest = address(loyaltyProgram);
    uint256 value = 0;
    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, gift, customerAddress);
    bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);
    
    vm.prank(customerAddress);  
    PackedUserOperation memory packedUserOp = sendPackedUserOp.generateSignedUserOperation(
      executeCallData, helperConfig.getConfig(), address(customerCard) 
      );
    PackedUserOperation[] memory ops = new PackedUserOperation[](1); 
    ops[0] = packedUserOp; 

    //act 
    console2.log("entryPoint address:", address(entryPoint)); 
    vm.prank(customerAddress);  
    IEntryPoint(address(entryPoint)).handleOps(ops, payable(randomUser)); 
    // vm.stopPrank(); 

    //assert -- build later
    // assertEq(usdc.balanceOf(address(customerCard)), AMOUNT);
  }

  function testEntryPointRevertsExecuteWithDisallowedFunction() public giveCustomerCardPointsAndGift(customerAddress) {
    address customerCardAddress = factoryCards.getAddress(customerAddress, payable(address(loyaltyProgram)), SALT);
    LoyaltyCard customerCard = LoyaltyCard(payable(customerCardAddress)); 
    uint256 gift = 0;

    // arrange
    address dest = address(loyaltyProgram);
    uint256 value = 0;
    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.setAllowCreationCards.selector, false);
    bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

    PackedUserOperation memory packedUserOp = sendPackedUserOp.generateSignedUserOperation(
      executeCallData, helperConfig.getConfig(), address(customerCard) 
      );

    PackedUserOperation[] memory ops = new PackedUserOperation[](1); 
    ops[0] = packedUserOp; 

    //act 
    address entryPoint = helperConfig.getConfig().entryPoint; 
    vm.prank(randomUser); 
    vm.expectRevert(); 
    IEntryPoint(entryPoint).handleOps(ops, payable(randomUser)); 

    //assert -- build later
    // assertEq(usdc.balanceOf(address(customerCard)), AMOUNT);
  }

  // https://github.com/ethereum/solidity/issues/14996 - its from PatrickC :) 
  function removeSelector(bytes memory myData) public pure returns(bytes memory, bytes4){
        uint256 BYTES4_SIZE = 4; 
        uint256 bytesSize = myData.length - BYTES4_SIZE;
        bytes memory dataWithoutSelector = new bytes(bytesSize);
        for (uint8 i = 0; i < bytesSize; i++) {
            dataWithoutSelector[i] = myData[i + BYTES4_SIZE];
        }
        bytes4 selector = bytes4(myData);
        return (dataWithoutSelector, selector);
  }


  /////////// quick helper function. ///////////
  function decode(bytes memory data) private pure returns (bytes4 selector, address target, uint256 value, bytes memory callData) {
      // `approvePaylaod[4:]` basically ignores the first 4 bytes of the payload
      (selector,target, value, callData) = abi.decode(data, (bytes4,address,uint256,bytes));
      return (selector,target, value, callData);
    }
    /////////// quick helper function. ///////////


  function testRetrieveAddressFromCalldata() public giveCustomerCardAndPoints(customerAddress) {
    // DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
    // (loyaltyProgram, helperConfig) = deployer.run();

    // address dest = address(loyaltyProgram);
    // uint256 value = 0;

    // bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
    // executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

    // address cardAddress = _getAddress(customerAddress, payable(address(loyaltyProgram)), SALT);
    // vm.prank(config.entryPoint); 
    // (bool success , bytes memory returnData) = cardAddress.call{value: 0}(executeCallData);

    // console2.logBytes(returnData); 
    
    // (bytes4 sig, address target, address sender)  = cardImplementation.funcParams(); 

    // logCalldata(abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData)); 

    // bytes32 selected;
    // assembly {
    //           selected:= executeCallData[:4]
    //         }
    
    // bytes4 selector; 
    // assembly {
    //     selector := calldataload(executeCallData.offset)
    // }


    // bytes4 selector = bytes4(executeCallData[:4]);
    
    // console2.logBytes32(selected); 
    // console2.logAddress(dest); 
    // console2.logBytes(executeCallData); 
  }

  /* helper functions */  

  function logCalldata(bytes calldata data) external {
    bytes4 selector = bytes4(data[:4]);
    console2.logBytes4(selector); 
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
    * @notice helper function to create digest hash from RedeemGift struct.
    */
  function hashRedeemGift(RedeemGift memory message) private pure returns (bytes32) {
      return keccak256(
          abi.encode(
              keccak256(bytes("RedeemGift(address program,address owner,address gift,uint256 giftId,uint256 uniqueNumber)")),
              message.program,
              message.owner,
              message.gift,
              message.giftId, 
              message.uniqueNumber
          )
      );
  }
}

// contract testExternalCallContract is Test {


//    /* Type declarations */
//   LoyaltyProgram loyaltyProgram; 
//   HelperConfig helperConfig;
//   FridayFifteen fridayFifteen; 
//   HelperConfig.NetworkConfig config; 
  
//   /* State variables */
//   uint256 vendorKey = vm.envUint("DEFAULT_ANVIL_KEY_0");
//   address vendorAddress = vm.addr(vendorKey);
//   uint256 customerKey = vm.envUint("DEFAULT_ANVIL_KEY_1");
//   address customerAddress = vm.addr(customerKey);
//   uint256 customerKey2 = vm.envUint("DEFAULT_ANVIL_KEY_2");
//   address customerAddress2 = vm.addr(customerKey2);

//   LoyaltyCard public cardImplementation;
//   uint256 private constant LOYALTY_PROGRAM_VERSION = 2; 
//   uint256 private constant SALT = 123456; 
//   bytes executeCallData; 


//   function setup() public {
//     DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
//     (loyaltyProgram, helperConfig) = deployer.run();

//     console2.logAddress(address(loyaltyProgram)); 
      
//     config = helperConfig.getConfig();
//     cardImplementation = new LoyaltyCard(IEntryPoint(config.entryPoint));

//     DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
//     fridayFifteen = deployerFridayFifteen.run();
    
//     address ownerProgram = loyaltyProgram.owner();
//     vm.prank(ownerProgram); 
//     loyaltyProgram.transferOwnership(vendorAddress);
//   }


//   function testCallOtherContract() public  {
//     address dest = address(loyaltyProgram);
//     uint256 value = 1;

//     bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
//     bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);



  //  }

// }
