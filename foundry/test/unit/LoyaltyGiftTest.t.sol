// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

// foundry imports // 
import {Test, console2} from "lib/forge-std/src/Test.sol";

// local imports // 
import {LoyaltyProgram} from "../../src/LoyaltyProgram.sol";
import {FactoryPrograms} from "../../src/FactoryPrograms.sol";
import {LoyaltyCard} from  "../../src/LoyaltyCard.sol";
import {FactoryCards} from  "../../src/FactoryCards.sol";
import {FridayFifteen} from "../../src/sample-gifts/FridayFifteen.sol";
import {FreeCoffee} from "../../src/sample-gifts/FreeCoffee.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployFactoryPrograms} from "../../script/DeployFactoryPrograms.s.sol";
import {DeployFridayFifteen, DeployFreeCoffee} from "../../script/DeployLoyaltyGifts.s.sol";

contract LoyaltyProgramTest is Test {

    /* Type declarations */
    FactoryPrograms factoryPrograms; 
    LoyaltyProgram loyaltyProgram; 
    HelperConfig helperConfig;
    FridayFifteen fridayFifteen; 
    FreeCoffee freeCoffee; 
    HelperConfig.NetworkConfig config; 
    FactoryCards factoryCards; 

    /* State variables */
    uint256 vendorKey = vm.envUint("DEFAULT_ANVIL_KEY_0");
    address vendorAddress = vm.addr(vendorKey);
    address ownerProgram;

    uint256 giftAmount = 15;  

    /* Events */

    ///////////////////////////////////////////////
    ///                Modifiers                ///
    ///////////////////////////////////////////////

    modifier mintGifts(uint256 amountGifts) {
      vm.startPrank(vendorAddress);
      loyaltyProgram.setAllowedGift(address(fridayFifteen), true, true);
      loyaltyProgram.mintGifts(address(fridayFifteen), amountGifts);
      
      loyaltyProgram.setAllowedGift(address(freeCoffee), true, true);
      loyaltyProgram.mintGifts(address(freeCoffee), amountGifts);
      vm.stopPrank(); 
      
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

      loyaltyProgram = factoryPrograms.deployLoyaltyProgram(
        name, 
        colourScheme, 
        cardImageUri
      );
      
      DeployFridayFifteen deployerFridayFifteen = new DeployFridayFifteen(); 
      fridayFifteen = deployerFridayFifteen.run();
      DeployFreeCoffee deployerFreeCoffee = new DeployFreeCoffee(); 
      freeCoffee = deployerFreeCoffee.run();
      
      ownerProgram = loyaltyProgram.owner();
      vm.prank(ownerProgram); 
      loyaltyProgram.transferOwnership(vendorAddress);
    }

    function testDirectTransferWorks() public mintGifts(giftAmount) {
      uint256 balance = freeCoffee.balanceOf(address(loyaltyProgram)); 
      assert(balance == giftAmount); 

      uint256 giftId = freeCoffee.tokenOfOwnerByIndex(address(loyaltyProgram), 0); 
      console2.log("giftId:", giftId);

      // loyaltyProgram.transferGift(customer, address(freeCoffee), giftId);
    }
}

