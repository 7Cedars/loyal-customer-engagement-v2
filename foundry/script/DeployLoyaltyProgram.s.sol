// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyProgram} from "../src/LoyaltyProgram.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract DeployLoyaltyProgram is Script {
    bytes32 SALT = bytes32(hex'7ceda5'); 

    function run() external returns (LoyaltyProgram, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        string memory name = "Highstreet Hopes";
        string memory colourScheme = '#3d5769;#c8cf0c'; 
        string memory cardImageUri = "";

        vm.startBroadcast();
            LoyaltyProgram loyaltyProgram = new LoyaltyProgram{salt: SALT}(
            name, 
            colourScheme, 
            cardImageUri,
            config.entryPoint, 
            config.factoryCards
        );
        vm.stopBroadcast();

        return (loyaltyProgram, helperConfig); 
    }
}



