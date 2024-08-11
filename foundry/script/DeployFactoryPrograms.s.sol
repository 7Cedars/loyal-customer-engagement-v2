// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyProgram} from "../src/LoyaltyProgram.sol";
import {FactoryPrograms} from "../src/FactoryPrograms.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract DeployFactoryPrograms is Script {
    bytes32 SALT = bytes32(hex'7ceda5'); 

    function run() external returns (FactoryPrograms, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        vm.startBroadcast();
            FactoryPrograms factoryPrograms = new FactoryPrograms{salt: SALT}(
            config.entryPoint, 
            config.factoryCards
        );
        vm.stopBroadcast();

        return (factoryPrograms, helperConfig); 
    }
}



