// NB! BEFORE going to production, ABIs need to be hard coded. This setup is for dev only.  

import { Abi } from "viem"
import loyaltyProgram from "../../../../foundry/out/LoyaltyProgram.sol/LoyaltyProgram.json"
import loyaltyGift from "../../../../foundry/out/LoyaltyGift.sol/LoyaltyGift.json"

export const loyaltyProgramAbi: Abi = JSON.parse(JSON.stringify(loyaltyProgram.abi)) // why?! why, why, why? It is NOT possible to directly import it. 
export const loyaltyGiftAbi: Abi  = JSON.parse(JSON.stringify(loyaltyGift.abi)) 

// export const loyaltyProgramAbi = [
//   {
//     "type": "constructor",
//     "inputs": [
//       { "name": "_name", "type": "string", "internalType": "string" },
//       { "name": "_cardImageUri", "type": "string", "internalType": "string" },
//       { "name": "_baseColour", "type": "bytes", "internalType": "bytes" },
//       { "name": "_accentColour", "type": "bytes", "internalType": "bytes" },
//       {
//         "name": "_anEntryPoint",
//         "type": "address",
//         "internalType": "address"
//       }
//     ],
//     "stateMutability": "nonpayable"
//   },
//   { "type": "fallback", "stateMutability": "payable" },
//   { "type": "receive", "stateMutability": "payable" },
//   {
//     "type": "function",
//     "name": "allowance",
//     "inputs": [
//       { "name": "owner", "type": "address", "internalType": "address" },
//       { "name": "spender", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "approve",
//     "inputs": [
//       { "name": "spender", "type": "address", "internalType": "address" },
//       { "name": "value", "type": "uint256", "internalType": "uint256" }
//     ],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "balanceOf",
//     "inputs": [
//       { "name": "account", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "cardImplementation",
//     "inputs": [],
//     "outputs": [
//       {
//         "name": "",
//         "type": "address",
//         "internalType": "contract LoyaltyCard"
//       }
//     ],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "decimals",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "entryPoint",
//     "inputs": [],
//     "outputs": [
//       {
//         "name": "",
//         "type": "address",
//         "internalType": "contract IEntryPoint"
//       }
//     ],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "exchangePointsForGift",
//     "inputs": [
//       { "name": "_gift", "type": "address", "internalType": "address" },
//       { "name": "_owner", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "getAddress",
//     "inputs": [
//       { "name": "owner", "type": "address", "internalType": "address" },
//       { "name": "salt", "type": "uint256", "internalType": "uint256" }
//     ],
//     "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "mintGifts",
//     "inputs": [
//       { "name": "_gift", "type": "address", "internalType": "address" },
//       { "name": "amount", "type": "uint256", "internalType": "uint256" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "name",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "onERC721Received",
//     "inputs": [
//       { "name": "", "type": "address", "internalType": "address" },
//       { "name": "", "type": "address", "internalType": "address" },
//       { "name": "", "type": "uint256", "internalType": "uint256" },
//       { "name": "", "type": "bytes", "internalType": "bytes" }
//     ],
//     "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
//     "stateMutability": "pure"
//   },
//   {
//     "type": "function",
//     "name": "owner",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "payCardPrefund",
//     "inputs": [
//       {
//         "name": "missingAccountFunds",
//         "type": "uint256",
//         "internalType": "uint256"
//       },
//       {
//         "name": "originalSender",
//         "type": "address",
//         "internalType": "address"
//       },
//       { "name": "ownerCard", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [
//       { "name": "success", "type": "bool", "internalType": "bool" }
//     ],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "redeemGift",
//     "inputs": [
//       { "name": "_program", "type": "address", "internalType": "address" },
//       { "name": "_ownerCard", "type": "address", "internalType": "address" },
//       { "name": "_gift", "type": "address", "internalType": "address" },
//       { "name": "_giftId", "type": "uint256", "internalType": "uint256" },
//       {
//         "name": "_uniqueNumber",
//         "type": "uint256",
//         "internalType": "uint256"
//       },
//       { "name": "signature", "type": "bytes", "internalType": "bytes" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "renounceOwnership",
//     "inputs": [],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "requestPointsAndCard",
//     "inputs": [
//       { "name": "_program", "type": "address", "internalType": "address" },
//       { "name": "_points", "type": "uint256", "internalType": "uint256" },
//       {
//         "name": "_uniqueNumber",
//         "type": "uint256",
//         "internalType": "uint256"
//       },
//       {
//         "name": "programSignature",
//         "type": "bytes",
//         "internalType": "bytes"
//       },
//       { "name": "_ownerCard", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "s_AccessGifts",
//     "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
//     "outputs": [
//       { "name": "redeemable", "type": "bool", "internalType": "bool" },
//       { "name": "exchangeable", "type": "bool", "internalType": "bool" }
//     ],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "s_allowCreationCards",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "s_colourScheme",
//     "inputs": [],
//     "outputs": [
//       { "name": "base", "type": "bytes", "internalType": "bytes" },
//       { "name": "accent", "type": "bytes", "internalType": "bytes" }
//     ],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "s_executed",
//     "inputs": [{ "name": "", "type": "bytes", "internalType": "bytes" }],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "s_imageUri",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "s_name",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "setAllowCreationCards",
//     "inputs": [{ "name": "allowed", "type": "bool", "internalType": "bool" }],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "setCardBlocked",
//     "inputs": [
//       { "name": "_owner", "type": "address", "internalType": "address" },
//       { "name": "blocked", "type": "bool", "internalType": "bool" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "setColourScheme",
//     "inputs": [
//       { "name": "base", "type": "bytes", "internalType": "bytes" },
//       { "name": "accent", "type": "bytes", "internalType": "bytes" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "setImageUri",
//     "inputs": [
//       { "name": "imageUri", "type": "string", "internalType": "string" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "setLoyaltyGift",
//     "inputs": [
//       { "name": "_gift", "type": "address", "internalType": "address" },
//       { "name": "exchangeable", "type": "bool", "internalType": "bool" },
//       { "name": "redeemable", "type": "bool", "internalType": "bool" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "supportsInterface",
//     "inputs": [
//       { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
//     ],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "symbol",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "totalSupply",
//     "inputs": [],
//     "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
//     "stateMutability": "view"
//   },
//   {
//     "type": "function",
//     "name": "transfer",
//     "inputs": [
//       { "name": "to", "type": "address", "internalType": "address" },
//       { "name": "value", "type": "uint256", "internalType": "uint256" }
//     ],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "transferFrom",
//     "inputs": [
//       { "name": "from", "type": "address", "internalType": "address" },
//       { "name": "to", "type": "address", "internalType": "address" },
//       { "name": "value", "type": "uint256", "internalType": "uint256" }
//     ],
//     "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "function",
//     "name": "transferOwnership",
//     "inputs": [
//       { "name": "newOwner", "type": "address", "internalType": "address" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   },
//   {
//     "type": "event",
//     "name": "Approval",
//     "inputs": [
//       {
//         "name": "owner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "spender",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "value",
//         "type": "uint256",
//         "indexed": false,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "ColourSchemeChanged",
//     "inputs": [
//       {
//         "name": "base",
//         "type": "bytes",
//         "indexed": true,
//         "internalType": "bytes"
//       },
//       {
//         "name": "accent",
//         "type": "bytes",
//         "indexed": true,
//         "internalType": "bytes"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "CreationCardsAllowed",
//     "inputs": [
//       {
//         "name": "allowed",
//         "type": "bool",
//         "indexed": true,
//         "internalType": "bool"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "GiftsMinted",
//     "inputs": [
//       {
//         "name": "gift",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "amount",
//         "type": "uint256",
//         "indexed": true,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "ImageUriChanged",
//     "inputs": [],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "Log",
//     "inputs": [
//       {
//         "name": "func",
//         "type": "string",
//         "indexed": false,
//         "internalType": "string"
//       },
//       {
//         "name": "gas",
//         "type": "uint256",
//         "indexed": false,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "LoyaltyCardBlocked",
//     "inputs": [
//       {
//         "name": "owner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "blocked",
//         "type": "bool",
//         "indexed": true,
//         "internalType": "bool"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "LoyaltyGiftListed",
//     "inputs": [
//       {
//         "name": "loyaltyGift",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "exchangeable",
//         "type": "bool",
//         "indexed": true,
//         "internalType": "bool"
//       },
//       {
//         "name": "redeemable",
//         "type": "bool",
//         "indexed": true,
//         "internalType": "bool"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "LoyaltyGiftRedeemed",
//     "inputs": [
//       {
//         "name": "owner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "gift",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "giftId",
//         "type": "uint256",
//         "indexed": true,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "LoyaltyPointsExchangeForGift",
//     "inputs": [
//       {
//         "name": "owner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "_gift",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "giftId",
//         "type": "uint256",
//         "indexed": true,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "LoyaltyProgramDeployed",
//     "inputs": [
//       {
//         "name": "owner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "version",
//         "type": "uint256",
//         "indexed": true,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "OwnershipTransferred",
//     "inputs": [
//       {
//         "name": "previousOwner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "newOwner",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       }
//     ],
//     "anonymous": false
//   },
//   {
//     "type": "event",
//     "name": "Transfer",
//     "inputs": [
//       {
//         "name": "from",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "to",
//         "type": "address",
//         "indexed": true,
//         "internalType": "address"
//       },
//       {
//         "name": "value",
//         "type": "uint256",
//         "indexed": false,
//         "internalType": "uint256"
//       }
//     ],
//     "anonymous": false
//   },
//   { "type": "error", "name": "ECDSAInvalidSignature", "inputs": [] },
//   {
//     "type": "error",
//     "name": "ECDSAInvalidSignatureLength",
//     "inputs": [
//       { "name": "length", "type": "uint256", "internalType": "uint256" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ECDSAInvalidSignatureS",
//     "inputs": [{ "name": "s", "type": "bytes32", "internalType": "bytes32" }]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InsufficientAllowance",
//     "inputs": [
//       { "name": "spender", "type": "address", "internalType": "address" },
//       { "name": "allowance", "type": "uint256", "internalType": "uint256" },
//       { "name": "needed", "type": "uint256", "internalType": "uint256" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InsufficientBalance",
//     "inputs": [
//       { "name": "sender", "type": "address", "internalType": "address" },
//       { "name": "balance", "type": "uint256", "internalType": "uint256" },
//       { "name": "needed", "type": "uint256", "internalType": "uint256" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InvalidApprover",
//     "inputs": [
//       { "name": "approver", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InvalidReceiver",
//     "inputs": [
//       { "name": "receiver", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InvalidSender",
//     "inputs": [
//       { "name": "sender", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "ERC20InvalidSpender",
//     "inputs": [
//       { "name": "spender", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__AlreadyExecuted",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__BlockedLoyaltyCard",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__CardDoesNotOwnGift",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__GiftExchangeFailed",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__GiftNotExchangeable",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__GiftNotRedeemable",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__IncorrectInterface",
//     "inputs": [
//       { "name": "gift", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__MoreThanMaxIncrease",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__NotRegisteredCard",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__NotSignedByOwner",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__OLoyaltyProgram__NoZeroAddressnlyLoyaltyCard",
//     "inputs": []
//   },
//   { "type": "error", "name": "LoyaltyProgram__OnlyCardHolder", "inputs": [] },
//   { "type": "error", "name": "LoyaltyProgram__OnlyEntryPoint", "inputs": [] },
//   {
//     "type": "error",
//     "name": "LoyaltyProgram__RequestNotFromProgramOwner",
//     "inputs": []
//   },
//   {
//     "type": "error",
//     "name": "OwnableInvalidOwner",
//     "inputs": [
//       { "name": "owner", "type": "address", "internalType": "address" }
//     ]
//   },
//   {
//     "type": "error",
//     "name": "OwnableUnauthorizedAccount",
//     "inputs": [
//       { "name": "account", "type": "address", "internalType": "address" }
//     ]
//   }
// ] as const 
