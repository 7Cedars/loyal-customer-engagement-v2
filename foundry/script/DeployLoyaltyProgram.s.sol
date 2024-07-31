// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyProgram} from "../src/LoyaltyProgram.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract DeployLoyaltyProgram is Script {
    function run() external returns (LoyaltyProgram, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        string memory name = "Highstreet Hopes";
        string memory cardImageUri = "";
        string memory baseColour = "#3d5769";
        string memory accentColour = "#c8cf0c"; 

        vm.startBroadcast();
            LoyaltyProgram loyaltyProgram = new LoyaltyProgram(
            name, 
            cardImageUri,
            baseColour,
            accentColour, 
            config.entryPoint
        );
        vm.stopBroadcast();

        return (loyaltyProgram, helperConfig); 
    }
}



