// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// OpenZeppelin imports //  
import {IERC165} from "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ECDSA} from "lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {IERC721Receiver} from  "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC165Checker} from "lib/openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";
import {MessageHashUtils} from "lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {Initializable} from "lib/openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

// eth-infinitism imports // 
import "lib/account-abstraction/contracts/core/Helpers.sol";
import "lib/account-abstraction/contracts/core/BaseAccount.sol";

// local imports // 
import {ILoyaltyGift} from "./interfaces/ILoyaltyGift.sol";
import {ILoyaltyProgram} from "./interfaces/ILoyaltyProgram.sol";

/**
 * A bespoke implementation of eth-infintism's SimpleAccount. 
 * In comparison to SimpleAccount, this implementation:
 * - registers parent contract with each created abstract account.   
 * - cannot do batched operations. 
 * - only allows ERC721 receiver (not ERC-1155). 
 * - has an additional check that only allows interactions with one address (its loyaltyProgram). 
 * - 
 */
contract LoyaltyCard is BaseAccount, IERC721Receiver, UUPSUpgradeable, Initializable {
    error LoyaltyCard__FailedOp(string reason); 
    
    address public s_owner;
    address payable public s_loyaltyProgram; 
    bytes public ret; 
    IEntryPoint private immutable _entryPoint;

    event LoyaltyCardCreated(address indexed entryPoint, address indexed owner, address indexed loyaltyProgram);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier onlyLoyaltyProgram() {
        _onlyLoyaltyProgram();
        _;
    }

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
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

    function decode(bytes memory data) private pure returns(bytes4 selector, bytes memory target, bytes memory callData) {
        assembly {
        // load 32 bytes into `selector` from `data` skipping the first 32 bytes
        selector := mload(add(data, 32))
        target := mload(add(data, 64))
        callData := mload(add(data, 96)) // this I added. don't know if it works. 
        }
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
      * the implementation by calling `upgradeTo()`
      * @param anOwner the owner (signer) of this account
     */
    function initialize(address anOwner, address payable loyaltyProgram) public virtual initializer {
        _initialize(anOwner, loyaltyProgram);
    }

    /**
     * allows loyalty program to withdraw value from the loyalty card account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyLoyaltyProgram {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _initialize(address anOwner, address payable _loyaltyProgram) internal virtual {
        s_owner = anOwner;
        s_loyaltyProgram = _loyaltyProgram; 
        emit LoyaltyCardCreated(address(_entryPoint), s_owner, s_loyaltyProgram); 
    }

    // Why not do this in regular way - without writing additional functions? Is this more gass efficient? 
    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        if(msg.sender != s_owner && msg.sender != address(this)) revert LoyaltyCard__FailedOp("LC01: only owner");
    }

    function _onlyLoyaltyProgram() internal view { 
        if(msg.sender != s_loyaltyProgram) revert LoyaltyCard__FailedOp("LC02: only loyalty program");
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        if(msg.sender != address(entryPoint()) && msg.sender != s_owner) revert LoyaltyCard__FailedOp("LC03: sender not owner or entryPoint");
    }

    /// implement template method of BaseAccount
    function _validateSignature(
        PackedUserOperation calldata userOp, 
        bytes32 userOpHash
        ) internal override virtual returns (uint256 validationData) {
            bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
            if (s_owner != ECDSA.recover(hash, userOp.signature)) {
                return SIG_VALIDATION_FAILED;
            } 
            return _validateTarget(userOp.callData);
            // following is replaced by the _validateTarget function
            // return SIG_VALIDATION_SUCCESS; 
    }

    // NB! I think this is the cause of the AA23 reverted - arithmetic overflow/underflow error! YEP! Without it the calls PASS! 
    // 
    function _validateTarget(
        bytes calldata data
        ) internal virtual returns (uint256 validationData) {
            // derived from a feature request by none other than PatrickC: https://github.com/ethereum/solidity/issues/14996
            // retrieve the target contract and calldata of the userOp innerCall. 
            uint256 BYTES4_SIZE = 4; 
            uint256 bytesSize = data.length - BYTES4_SIZE;
            bytes memory dataWithoutSelector = new bytes(bytesSize);
            for (uint16 i = 0; i < bytesSize; i++) {
                dataWithoutSelector[i] = data[i + BYTES4_SIZE];
            }
            (address targetContract, , bytes memory innerCall) = abi.decode(dataWithoutSelector, (address, uint256, bytes)); 
            if(targetContract != s_loyaltyProgram) { 
                return SIG_VALIDATION_FAILED; 
            }
            // the following is not necessary and consumes gas: functions are role restricted in the target contract. 
            // bytes4 targetSelector = bytes4(innerCall);
            // if(
            //     targetSelector != ILoyaltyProgram.requestPoints.selector &&
            //     targetSelector != ILoyaltyProgram.exchangePointsForGift.selector 
            //     ) { 
            //     return SIG_VALIDATION_FAILED; 
            // }
            return SIG_VALIDATION_SUCCESS;
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
            ILoyaltyProgram(s_loyaltyProgram).payCardPrefund(missingAccountFunds, msg.sender); 
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
