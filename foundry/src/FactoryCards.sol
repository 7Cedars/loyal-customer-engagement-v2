// This is a near copy of SimpleAccountFactory.sol from ethinfinity (?) £check correct source. 
// See acknowledgements below. 

// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.26;

import {ERC1967Proxy} from "lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import {LoyaltyCard} from "./LoyaltyCard.sol";
import {LoyaltyProgram} from "./LoyaltyProgram.sol"; 
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * A simple factory contract for creating Loyalty Cards. 
 * A near copy of the standard SimpleAccountFactory, except that create cards register the program that creates them. 
 * This enables cards to be restricted to only calling functions on their parent loyaltyProgram contract. 
 * -- original text: -- 
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
contract FactoryCards {
    LoyaltyCard public immutable cardImplementation;

    error FactoryCards__NotRegisteredCard(); 

    constructor(IEntryPoint _entryPoint) {
        cardImplementation = new LoyaltyCard(_entryPoint);
    }

    /**
     * exact copy from SimpleAccountFactory.sol, except here it is an internal function. 
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    // function createAccount(address owner,uint256 salt) public returns (SimpleAccount ret) {
    //     address addr = getAddress(owner, salt);
    //     uint256 codeSize = addr.code.length;
    //     if (codeSize > 0) {
    //         return SimpleAccount(payable(addr));
    //     }
    //     ret = SimpleAccount(payable(new ERC1967Proxy{salt : bytes32(salt)}(
    //             address(accountImplementation),
    //             abi.encodeCall(SimpleAccount.initialize, (owner))
    //         )));
    // }
    function getLoyaltyCard(
      address owner, 
      address payable loyaltyProgram, 
      uint256 salt
      ) external returns (LoyaltyCard newCard) {
        address addr = getAddress(owner, loyaltyProgram, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return LoyaltyCard(payable(addr));
        }
        if (!LoyaltyProgram(loyaltyProgram).s_allowCreationCards()) {
            revert FactoryCards__NotRegisteredCard(); 
        }
        newCard = LoyaltyCard(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(cardImplementation),
                abi.encodeCall(LoyaltyCard.initialize, (owner, loyaltyProgram))
            )));
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     * exact copy from SimpleAccountFactory.sol, except it takes loyaltyProgram as param
     */
    function getAddress(address owner, address payable loyaltyProgram, uint256 salt) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(cardImplementation),
                    abi.encodeCall(LoyaltyCard.initialize, (owner, loyaltyProgram))
                )
            )));
    }
}
