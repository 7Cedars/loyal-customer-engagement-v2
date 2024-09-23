// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/* imports */ 
import {LoyaltyProgram} from "./LoyaltyProgram.sol";

/* interfaces, libraries, contracts */
contract FactoryPrograms {

/* State variables */
address immutable public ENTRY_POINT; 
address immutable public FACTORY_CARDS;

/* Events */
event FactoryProgramsDeployed(address indexed entryPoint, address  indexed factoryCards);
event ProgramDeployed(address indexed program);

/* Modifiers */
constructor( 
  address entryPoint,
  address factoryCards
  ) {
    ENTRY_POINT = entryPoint; 
    FACTORY_CARDS = factoryCards; 
}

function deployLoyaltyProgram(
  string memory name, 
  string memory colourScheme, // in the format of: '#111111;#ffffff'
  string memory cardImageUri
) public returns (LoyaltyProgram loyaltyProgram) {
    loyaltyProgram = new LoyaltyProgram(
      name, colourScheme, cardImageUri, msg.sender, ENTRY_POINT, FACTORY_CARDS
    );
    emit ProgramDeployed(address(loyaltyProgram));
  } 
}

    //////////////////////////////////////////////////////////////////
    //                          Notes to self                       // 
    //////////////////////////////////////////////////////////////////

    // When reviewing this code, check: https://github.com/transmissions11/solcurity
    // see also: https://github.com/nascentxyz/simple-security-toolkit

    // Structure contract // -- from Patrick Collins. 
    /* version */
    /* imports */
    /* errors */
    /* interfaces, libraries, contracts */
    /* Type declarations */
    /* State variables */
    /* Events */
    /* Modifiers */

    /* FUNCTIONS: */
    /* constructor */
    /* receive function (if exists) */
    /* fallback function (if exists) */
    /* external */
    /* public */
    /* internal */
    /* private */
    /* internal & private view & pure functions */
    /* external & public view & pure functions */
