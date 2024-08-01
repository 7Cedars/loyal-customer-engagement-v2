// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

// openZeppelin imports 
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";

// eth-infinitism imports // 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

// local imports // 
import {LoyaltyProgram} from "../../src/LoyaltyProgram.sol";
import {LoyaltyCard} from  "../../src/LoyaltyCard.sol";
import {FridayFifteen} from "../../src/sample-gifts/FridayFifteen.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployLoyaltyProgram} from "../../script/DeployLoyaltyProgram.s.sol";
import {DeployFridayFifteen} from "../../script/DeployLoyaltyGifts.s.sol";

contract LoyaltyCardTest is Test {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;

  /* Type declarations */
  LoyaltyProgram loyaltyProgram; 
  HelperConfig helperConfig;
  FridayFifteen fridayFifteen; 
  HelperConfig.NetworkConfig config; 
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

  LoyaltyCard public cardImplementation;
  uint256 private constant LOYALTY_PROGRAM_VERSION = 2; 
  uint256 private constant SALT = 123456; 
  bytes executeCallData; 


  modifier giveCustomerCardAndPoints(address customer) {
    DOMAIN_SEPARATOR =_hashDomain(
          EIP712Domain({
              name: "Highstreet Hopes",
              version: LOYALTY_PROGRAM_VERSION,
              chainId: block.chainid,
              verifyingContract: address(loyaltyProgram)
          })
      );
    uint256 points = 50000; 
    uint256 uniqueNumber = block.number; 
      
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


  function setUp() public {
      DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
      (loyaltyProgram, helperConfig) = deployer.run();

      console2.logAddress(address(loyaltyProgram)); 
        
      config = helperConfig.getConfig();
      cardImplementation = new LoyaltyCard(IEntryPoint(config.entryPoint), payable(address(this)));

      DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
      fridayFifteen = deployerFridayFifteen.run();
      
      address ownerProgram = loyaltyProgram.owner();
      vm.prank(ownerProgram); 
      loyaltyProgram.transferOwnership(vendorAddress);
  }

  function testRetrieveAddressFromCalldata() public giveCustomerCardAndPoints(customerAddress) {
    DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
    (loyaltyProgram, helperConfig) = deployer.run();

    address dest = address(loyaltyProgram);
    uint256 value = 0;

    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
    executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

    address cardAddress = _getAddress(customerAddress, SALT);
    vm.prank(config.entryPoint); 
    (bool success , bytes memory returnData) = cardAddress.call{value: 0}(executeCallData);

    console2.logBytes(returnData); 
    
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
  function _getAddress(address owner, uint256 salt) internal view returns (address) {
      return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
              type(ERC1967Proxy).creationCode,
              abi.encode(
                  address(cardImplementation),
                  abi.encodeCall(LoyaltyCard.initialize, (owner))
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

}

contract testExternalCallContract is Test {


   /* Type declarations */
  LoyaltyProgram loyaltyProgram; 
  HelperConfig helperConfig;
  FridayFifteen fridayFifteen; 
  HelperConfig.NetworkConfig config; 
  
  /* State variables */
  uint256 vendorKey = vm.envUint("DEFAULT_ANVIL_KEY_0");
  address vendorAddress = vm.addr(vendorKey);
  uint256 customerKey = vm.envUint("DEFAULT_ANVIL_KEY_1");
  address customerAddress = vm.addr(customerKey);
  uint256 customerKey2 = vm.envUint("DEFAULT_ANVIL_KEY_2");
  address customerAddress2 = vm.addr(customerKey2);

  LoyaltyCard public cardImplementation;
  uint256 private constant LOYALTY_PROGRAM_VERSION = 2; 
  uint256 private constant SALT = 123456; 
  bytes executeCallData; 


  function setup() public {
    DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
    (loyaltyProgram, helperConfig) = deployer.run();

    console2.logAddress(address(loyaltyProgram)); 
      
    config = helperConfig.getConfig();
    cardImplementation = new LoyaltyCard(IEntryPoint(config.entryPoint), payable(address(this)));

    DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
    fridayFifteen = deployerFridayFifteen.run();
    
    address ownerProgram = loyaltyProgram.owner();
    vm.prank(ownerProgram); 
    loyaltyProgram.transferOwnership(vendorAddress);
  }


  function testCallOtherContract() public  {
    address dest = address(loyaltyProgram);
    uint256 value = 1;

    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
    bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);



  }

}
