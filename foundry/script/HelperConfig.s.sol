// SPDX-License-Identifier: MIT
pragma solidity 0.8.26; 

import {Script, console2} from "lib/forge-std/src/Script.sol";
import {LoyaltyCard} from "../src/LoyaltyCard.sol"; 
import {LoyaltyProgram} from "../src/LoyaltyProgram.sol"; 
import {FactoryCards} from "../src/FactoryCards.sol"; 
import {EntryPoint} from "lib/account-abstraction/contracts/core/EntryPoint.sol"; 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol"; 


contract HelperConfig is Script {
  error HelperConfig__InvalidChainId(); 

  struct NetworkConfig {
    address entryPoint;
    address factoryCards; 
    address account;
    // I can add more configs as needed later on.  
  }
  
  // note: for now configs are the same for all these chains. 
  // it is likely this will change later on. 
  ///   
  uint256 constant LOCAL_CHAIN_ID = 31337;
  uint256 constant ETH_SEPOLIA_CHAIN_ID = 11155111; 
  uint256 constant OPS_SEPOLIA_CHAIN_ID = 11155420; 
  uint256 constant ARB_SEPOLIA_CHAIN_ID = 421614; 
  uint256 constant BASE_SEPOLIA_CHAIN_ID = 84532; 
  address  BURNER_WALLET = vm.envAddress("BURNER_WALLET");
  address constant ANVIL_DEFAULT_ACCOUNT = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; 
  bytes32 SALT = bytes32(hex'7ceda5'); 

  NetworkConfig public localNetworkConfig; 
  mapping(uint256 chainId => NetworkConfig) public networkConfig;

  constructor() { 
    networkConfig[ETH_SEPOLIA_CHAIN_ID] = getEthSepoliaConfig(); 
    // £todo Here still need to add other chains! 
  }

  function getConfig() public returns (NetworkConfig memory) { 
    return getConfigByChainId(block.chainid); 
  }

  function getConfigByChainId(uint256 chainId) public returns (NetworkConfig memory) { 
    if (chainId == LOCAL_CHAIN_ID) { 
      return getOrCreateAnvilEthConfig(); 
    } else if (networkConfig[chainId].entryPoint != address(0)) {
      return networkConfig[chainId]; 
    } else {
      revert HelperConfig__InvalidChainId(); 
    }
  }

  function getEthSepoliaConfig() public view returns(NetworkConfig memory){ 
    return NetworkConfig({
      entryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032, 
      factoryCards: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, // to be filled out after first deployment. 
      account: BURNER_WALLET
    });
  }

  function getOpsSepoliaConfig() public view returns(NetworkConfig memory){ 
    return NetworkConfig({
      entryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032, 
      factoryCards: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, // to be filled out after first deployment. 
      account: BURNER_WALLET
    });
  }

  function getArbSepoliaConfig() public view returns(NetworkConfig memory){ 
    return NetworkConfig({
      entryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032, 
      factoryCards: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, // to be filled out after first deployment. 
      account: BURNER_WALLET
    });
  }

  function getBaseSepoliaConfig() public view returns(NetworkConfig memory){ 
    return NetworkConfig({
      entryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032, 
      factoryCards: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, // to be filled out after first deployment. 
      account: BURNER_WALLET
    });
  }

  function getOrCreateAnvilEthConfig() public returns(NetworkConfig memory){ 
    if (localNetworkConfig.entryPoint != address(0)) { 
      return localNetworkConfig; 
    }
    // deploy mock entrypoint and factoryCards contracts.
    // (separated the broadcasts for clarity.)
    // console2.log("Deploying Mock EntryPoint..."); 
    // vm.startBroadcast(ANVIL_DEFAULT_ACCOUNT); 
    // EntryPoint entryPoint = new EntryPoint{salt: SALT}();
    // vm.stopBroadcast(); 
    // console2.log(address(entryPoint)); 

    console2.log("Deploying Mock FactoryCards..."); 
    vm.startBroadcast(ANVIL_DEFAULT_ACCOUNT); 
    FactoryCards factoryCards = new FactoryCards{salt: SALT}(IEntryPoint(0x0000000071727De22E5E9d8BAf0edAc6f37da032));  
    vm.stopBroadcast(); 
    console2.log(address(factoryCards)); 

    localNetworkConfig =  NetworkConfig({
        entryPoint: 0x0000000071727De22E5E9d8BAf0edAc6f37da032, // address(entryPoint), 
        factoryCards: address(factoryCards), 
        account: ANVIL_DEFAULT_ACCOUNT
        }); 
    return localNetworkConfig;
  }
}


//////////////////////////////////////////////////////////////////
//                      Acknowledgements                        // 
//////////////////////////////////////////////////////////////////


/**
    - Patrick Collins & Cyfrin: @https://updraft.cyfrin.io/courses/advanced-foundry/account-abstraction
*/ 