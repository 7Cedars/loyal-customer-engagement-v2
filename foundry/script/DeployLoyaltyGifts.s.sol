// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyGift} from "../src/LoyaltyGift.sol";

import {FreeCoffee} from "../src/sample-gifts/FreeCoffee.sol";
import {FreeCupCake} from "../src/sample-gifts/FreeCupCake.sol";
import {FridayFifteen} from "../src/sample-gifts/FridayFifteen.sol";

contract DeployFreeCoffee is Script {
    function run() external returns (FreeCoffee) {
        vm.startBroadcast();
        FreeCoffee freeCoffee = new FreeCoffee();
        vm.stopBroadcast();
        return freeCoffee;
    }
}

contract DeployFreeCupCake is Script {
    function run() external returns (FreeCupCake) {
        vm.startBroadcast();
        FreeCupCake freeCupCake = new FreeCupCake();
        vm.stopBroadcast();
        return freeCupCake;
    }
}

contract DeployFridayFifteen is Script {
    function run() external returns (FridayFifteen) {
        vm.startBroadcast();
        FridayFifteen fridayFifteen = new FridayFifteen();
        vm.stopBroadcast();
        return fridayFifteen;
    }
}