// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

// local imports // 
import {LoyaltyProgram} from "../../src/LoyaltyProgram.sol";
import {LoyaltyCard} from  "../../src/LoyaltyCard.sol";
import {FactoryCards} from  "../../src/FactoryCards.sol";
import {FactoryPrograms} from "../../src/FactoryPrograms.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployFactoryPrograms} from "../../script/DeployFactoryPrograms.s.sol";

contract FactoryProgramTest is Test {
  FactoryPrograms factoryPrograms; 
  LoyaltyProgram loyaltyProgram; 
  HelperConfig helperConfig;
  HelperConfig.NetworkConfig config; 

  /* State variables */
  uint256 vendorKey = vm.envUint("DEFAULT_ANVIL_KEY_0");
  address vendorAddress = vm.addr(vendorKey);

  LoyaltyCard public cardImplementation;
  uint256 private constant LOYALTY_PROGRAM_VERSION = 2; 
  uint256 private constant SALT = 123456; 
  
  /* Events */
  event LoyaltyProgramDeployed(address indexed s_owner,  uint256 indexed LOYALTY_PROGRAM_VERSION);

  function setUp() external {
    DeployFactoryPrograms deployer = new DeployFactoryPrograms();
    (factoryPrograms, helperConfig) = deployer.run();
    config = helperConfig.getConfig();
  }
  
  function testFactoryCanDeployProgram() public {
    string memory name = "an additional program"; 
    string memory colourScheme = '#3d5769;#c8cf0c'; 
    string memory cardImageUri = ""; 

    vm.startPrank(vendorAddress); 
    loyaltyProgram = factoryPrograms.deployLoyaltyProgram(
      name, colourScheme, cardImageUri
      );
    vm.stopPrank();

    assert(address(loyaltyProgram) != address(0));
   }
}