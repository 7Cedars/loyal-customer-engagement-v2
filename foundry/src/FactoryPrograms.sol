// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/* imports */ 
import {LoyaltyProgram} from "./LoyaltyProgram.sol";

/* interfaces, libraries, contracts */
contract FactoryPrograms {

/* State variables */
address immutable public s_entryPoint; 
address immutable public s_factoryCards;

/* Events */
event FactoryProgramsDeployed(address indexed entryPoint, address  indexed factoryCards);
event ProgramDeployed(address indexed program);

/* Modifiers */
constructor( 
  address _anEntryPoint,
  address _factoryCards
  ) {
    s_entryPoint = _anEntryPoint; 
    s_factoryCards = _factoryCards; 
}

function deployLoyaltyProgram(
  string memory _name, 
  string memory _colourScheme, // in the format of: '#111111;#ffffff'
  string memory _cardImageUri
) public returns (LoyaltyProgram loyaltyProgram) {
    loyaltyProgram = new LoyaltyProgram(
      _name, _colourScheme, _cardImageUri, s_entryPoint, s_factoryCards
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
