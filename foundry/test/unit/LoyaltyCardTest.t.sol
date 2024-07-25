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

  function testRetrieveAddressFromCalldata() public {
    DeployLoyaltyProgram deployer = new DeployLoyaltyProgram();
    (loyaltyProgram, helperConfig) = deployer.run();

    address dest = address(loyaltyProgram);
    uint256 value = 10;

    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
    executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

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


  function testCallOtherContract() public {
    address dest = address(loyaltyProgram);
    uint256 value = 1;


    bytes memory functionData = abi.encodeWithSelector(LoyaltyProgram.exchangePointsForGift.selector, address(fridayFifteen), customerAddress);
    bytes memory executeCallData = abi.encodeWithSelector(LoyaltyCard.execute.selector, dest, value, functionData);

    (bool success , bytes memory returnData) = address(cardImplementation).call{value: 0}(executeCallData);

  }
}
