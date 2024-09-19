// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";
import {VmSafe} from "lib/forge-std/src/Vm.sol";

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
import {FreeCoffee} from "../../src/sample-gifts/FreeCoffee.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployFactoryPrograms} from "../../script/DeployFactoryPrograms.s.sol";
import {DeployFridayFifteen, DeployFreeCoffee} from "../../script/DeployLoyaltyGifts.s.sol";
import {ILoyaltyProgram} from "../../src/interfaces/ILoyaltyProgram.sol";

contract LoyaltyCardFuzzTest is Test {
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
  FreeCoffee freeCoffee; 
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

  ///////////////////////////////////////////////
  ///                   Setup                 ///
  ///////////////////////////////////////////////

  function setUp() external {
    string memory name = "Highstreet Hopes";
    string memory colourScheme = '#3d5769;#c8cf0c'; 
    string memory cardImageUri = "";
    uint256 amountGifts = 100; 

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
    DeployFreeCoffee deployerFreeCoffee = new DeployFreeCoffee(); 
    freeCoffee = deployerFreeCoffee.run();
    
    ownerProgram = loyaltyProgram.owner();
    vm.prank(ownerProgram); 
    loyaltyProgram.transferOwnership(vendorAddress);

    vm.startPrank(vendorAddress);
    loyaltyProgram.setExchangeableGift(address(freeCoffee), true);
    loyaltyProgram.setRedeemableGift(address(freeCoffee), true);
    loyaltyProgram.mintGifts(address(freeCoffee), amountGifts);
    vm.stopPrank(); 
  }

  ///////////////////////////////////////////////
  ///                   Tests                 ///
  ///////////////////////////////////////////////

  function testEntryPointCanExecuteRequestPointsFuzz(uint256 customerKey) public {
    customerKey = bound(customerKey, 10, 999_999);
    address customer = vm.addr(customerKey);
    LoyaltyCard customerCard = factoryCards.createAccount(customer, payable(address(loyaltyProgram)), SALT);

    // A: let vendor create a points voucher. 
    // 1: domain separator 
    DOMAIN_SEPARATOR =_hashDomain(
          EIP712Domain({
              name: "Highstreet Hopes",
              version: LOYALTY_PROGRAM_VERSION,
              chainId: block.chainid,
              verifyingContract: address(loyaltyProgram)
          })
      );
      
    // 2: loyalty program owner creates voucher for 5000 points. 
    RequestPoints memory message = RequestPoints({
        program: address(loyaltyProgram),
        points: points, 
        uniqueNumber: uniqueNumber
    });

    // 3: vender signs the voucher
    bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashRequestPoints(message));
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(vendorKey, digest);
    bytes memory signature = abi.encodePacked(r, s, v);

    bytes memory functionData = abi.encodeWithSelector(
      LoyaltyProgram.requestPoints.selector, 
      address(loyaltyProgram), 
      points, 
      uniqueNumber, 
      signature, 
      customer);
    bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, address(loyaltyProgram), 0, functionData);

    HelperConfig.NetworkConfig memory config = helperConfig.getConfig(); 
    config.key = customerKey; 
    
    vm.startPrank(customer);  
    PackedUserOperation memory packedUserOp = sendPackedUserOp.generateSignedUserOperation(
      executeCallData, config, address(customerCard) 
      );
    vm.stopPrank();

    PackedUserOperation[] memory ops = new PackedUserOperation[](1); 
    ops[0] = packedUserOp; 

    //act 
    console2.log("entryPoint address:", address(entryPoint)); 
    vm.prank(customer);  
    IEntryPoint(address(entryPoint)).handleOps(ops, payable(randomUser)); 

    //assert -- build later
    // assertEq(usdc.balanceOf(address(customerCard)), AMOUNT);
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