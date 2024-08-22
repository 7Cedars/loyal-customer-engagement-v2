// SPDX-License-Identifier: MIT
// Following along with class @https://updraft.cyfrin.io/courses/advanced-foundry/account-abstraction
pragma solidity 0.8.26; 

import {Script} from "forge-std/Script.sol";
import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";
import {EntryPoint} from "lib/account-abstraction/contracts/core/EntryPoint.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SendPackedUserOp is Script {
  using MessageHashUtils for bytes32;

  function run() public {
    // to actuall deploy and run, this has to be completed. 
    // for if/when I want to do this, see: https://updraft.cyfrin.io/courses/advanced-foundry/account-abstraction/live-demo-eth?lesson_format=video
  }

  function generateSignedUserOperation (
    bytes memory callData,
    HelperConfig.NetworkConfig memory config,
    address loyaltyCard
    ) public view returns (PackedUserOperation memory) {
    uint256 nonce = vm.getNonce(loyaltyCard) - 1;
    PackedUserOperation memory userOp = _generateuserOperation(callData, loyaltyCard, nonce);

    // getUserOphash
    bytes32 userOpHash = EntryPoint(payable(config.entryPoint)).getUserOpHash(userOp);
    bytes32 digest = userOpHash.toEthSignedMessageHash();

    //sign it
    uint8 v;
    bytes32 r; 
    bytes32 s;
    if (block.chainid == 31337) {
      (v, r, s) = vm.sign(vm.envUint("DEFAULT_ANVIL_KEY_1"), digest); // NB! it is the customerCard that signs here! 
    } else {
      (v, r, s) = vm.sign(config.account, digest);
    }
    userOp.signature = abi.encodePacked(r, s, v);
    return userOp;
  }

  function _generateuserOperation (
    bytes memory callData,
    address sender,
    uint256 nonce
    ) internal pure returns (PackedUserOperation memory) {
      uint256 verificationGasLimit = 16777216;
      uint256 callGasLimit = verificationGasLimit;
      uint256 maxPriorityFeePerGas = 256;
      uint256 maxFeePerGas = maxPriorityFeePerGas;

      return PackedUserOperation({
        sender: sender,
        nonce: nonce,
        initCode: hex"",
        callData:callData,
        accountGasLimits: bytes32(uint256(verificationGasLimit) << 128 | callGasLimit),
        preVerificationGas: verificationGasLimit,
        gasFees: bytes32(uint256(maxPriorityFeePerGas) << 128 | maxFeePerGas),
        paymasterAndData: hex"",
        signature: hex""
    });
  }

// struct PackedUserOperation {
//     address sender;
//     uint256 nonce;
//     bytes initCode;
//     bytes callData;
//     bytes32 accountGasLimits;
//     uint256 preVerificationGas;
//     bytes32 gasFees;
//     bytes paymasterAndData;
//     bytes signature;
// }
} 

