// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyProgram} from "../src/LoyaltyProgram.sol";
import {FactoryPrograms} from "../src/FactoryPrograms.sol";
import {FactoryCards} from "../src/FactoryCards.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract DeployFactoryPrograms is Script {
    bytes32 SALT = bytes32(hex'7ceda521'); 
    error DeployFactoryProgrmas__DeployedContractAtAddress(address deploymentAddress); 

    function run() external returns (FactoryPrograms, FactoryCards, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        FactoryPrograms factoryPrograms; 
        FactoryCards factoryCards; 

        vm.startBroadcast();
            factoryCards = new FactoryCards(IEntryPoint(config.entryPoint));
            factoryPrograms = new FactoryPrograms(
                config.entryPoint, 
                address(factoryCards)
                );
        vm.stopBroadcast();

        return (factoryPrograms, factoryCards, helperConfig); 
    }
}



