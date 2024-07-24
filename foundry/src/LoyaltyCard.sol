// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from  "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {console} from "forge-std/Script.sol";

// eth-infinitism imports // 
import "lib/account-abstraction/contracts/core/Helpers.sol";
import "lib/account-abstraction/contracts/core/BaseAccount.sol";

// local imports // 
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

/**
 * A simplified implementation of eth-infintism's SimpleAccount. 
 * In comparison to SimpleAccount, this implementation: 
 * - cannot do batched operations. 
 * - can only deal with ERC721 tokens. 
 * - has an additional check that only allows interactions with one address (its loyaltyProgram). - this is still WIP. 
 * - functions are ordered along order defined below contract. 
 */

contract LoyaltyCard is BaseAccount, IERC721Receiver, UUPSUpgradeable, Initializable {

    address public immutable i_owner;
    address public immutable i_loyaltyProgram;
    IEntryPoint private immutable _entryPoint;

    event LoyaltyCardCreated(IEntryPoint indexed entryPoint, address indexed owner, address indexed loyaltyProgram);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier onlyLoyaltyProgram() {
        _onlyLoyaltyProgram();
        _;
    }

    constructor(IEntryPoint anEntryPoint, address _owner, address _loyaltyProgram) {
        _entryPoint = anEntryPoint;
        i_owner = _owner;
        i_loyaltyProgram = _loyaltyProgram; 

        _disableInitializers();
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     * @param dest destination address to call
     * @param value the value to pass in this call
     * @param func the calldata to pass in this call
     */
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

        /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
      * the implementation by calling `upgradeTo()`
      * @param anOwner the owner (signer) of this account
     */
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    /**
     * allows loyalty program to withdraw value from the loyalty card account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyLoyaltyProgram {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _initialize(address anOwner) internal virtual {
        i_owner = anOwner;
        emit LoyaltyCardCreated(_entryPoint, i_owner, i_loyaltyProgram); 
    }

    // Why not do this in regular way - without writing additional functions? Is this more gass efficient? 
    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(msg.sender == i_owner || msg.sender == address(this), "only owner");
    }

    function _onlyLoyaltyProgram() internal view { 
        require(msg.sender == i_loyaltyProgram, "only loyalty program");
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || msg.sender == i_owner, "account: not Owner or EntryPoint");
    }


    /// implement template method of BaseAccount
    function _validateSignature(
        PackedUserOperation calldata userOp, 
        bytes32 userOpHash
        ) internal override virtual returns (uint256 validationData) {
            bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
            if (i_owner != ECDSA.recover(hash, userOp.signature)) {
                return SIG_VALIDATION_FAILED;
            } 
            
            // check for valid recipient. 
            (bool success) =  _validateRecipient(userOp);
            if (!success) {
                return SIG_VALIDATION_FAILED;
            } 

            return SIG_VALIDATION_SUCCESS;
    }
    
    /**
     * £todo This function should retrieve the recipient 'callee' address from callData - this bit is difficult. Check ERC-2771? 
     * then check if it is the same as address loyalty Program  
     * if not, revert. 
     *
     */
    function _validateRecipient(
        PackedUserOperation calldata userOp
    ) internal returns (bool success) { // £todo implement later: returns (uint256 validationData)
        // Need to check how callData is encoded. 
        return true; 
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * Overrides _payPrefund from base account. 
     * all missingAccountFunds are paid - directly, without checks - by loyalty Program. 
     * this is only possible because permitted transactions by loyalty Cards are very limited. 
     * They are, in a sense, programatically pre-approved.  

     * @param missingAccountFunds - The minimum value this method should send the entrypoint.
     *                              This value MAY be zero, in case there is enough deposit,
     *                              or the userOp has a paymaster.
     */
    function _payPrefund(uint256 missingAccountFunds) internal override {
        if (missingAccountFunds != 0) {
            // notice: msg.sender == the entrypoint. It is the entryPoint that is calling this function. 
            ILoyaltyProgram(i_loyaltyProgram).payCardPrefund(missingAccountFunds, msg.sender); 
            // (success);
            //ignore failure (its EntryPoint's job to verify, not account.)
        }
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // £audit: only LoyaltyProgram can upgrade implementation. 
    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _onlyLoyaltyProgram(); 
    }

}

    //////////////////////////////////////////////////////////////////
    //                      Acknowledgements                        // 
    //////////////////////////////////////////////////////////////////


    /**
        - Patrick Collins & Cyfrin 
        - solidity by example 
        - accoutn abstraction by eth-infinitism 
    */ 


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
