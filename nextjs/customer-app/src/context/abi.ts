// NB! BEFORE going to production, ABIs need to be hard coded. This setup is for dev only.  

import { Abi } from "viem"
// import entryPoint from "../../../../foundry/out/EntryPoint.sol/EntryPoint.json"
// import factoryPrograms from "../../../../foundry/out/FactoryPrograms.sol/FactoryPrograms.json"
// import factoryCards from "../../../../foundry/out/FactoryCards.sol/FactoryCards.json"
// import loyaltyProgram from "../../../../foundry/out/LoyaltyProgram.sol/LoyaltyProgram.json"
// import loyaltyCard from "../../../../foundry/out/LoyaltyCard.sol/LoyaltyCard.json"
// import loyaltyGift from "../../../../foundry/out/LoyaltyGift.sol/LoyaltyGift.json"

// export const entryPointAbi: Abi = JSON.parse(JSON.stringify(entryPoint.abi)) 
// export const factoryProgramsAbi: Abi = JSON.parse(JSON.stringify(factoryPrograms.abi)) 
// export const factoryCardsAbi: Abi = JSON.parse(JSON.stringify(factoryCards.abi)) 
// export const loyaltyProgramAbi: Abi = JSON.parse(JSON.stringify(loyaltyProgram.abi)) // why?! why, why, why? It is NOT possible to directly import it. 
// export const loyaltyCardAbi: Abi  = JSON.parse(JSON.stringify(loyaltyCard.abi)) 
// export const loyaltyGiftAbi: Abi  = JSON.parse(JSON.stringify(loyaltyGift.abi)) 


export const entryPointAbi: Abi = [
  { "type": "receive", "stateMutability": "payable" },
  {
    "type": "function",
    "name": "addStake",
    "inputs": [
      {
        "name": "unstakeDelaySec",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "delegateAndRevert",
    "inputs": [
      { "name": "target", "type": "address", "internalType": "address" },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "depositTo",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "deposits",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [
      { "name": "deposit", "type": "uint256", "internalType": "uint256" },
      { "name": "staked", "type": "bool", "internalType": "bool" },
      { "name": "stake", "type": "uint112", "internalType": "uint112" },
      {
        "name": "unstakeDelaySec",
        "type": "uint32",
        "internalType": "uint32"
      },
      { "name": "withdrawTime", "type": "uint48", "internalType": "uint48" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDepositInfo",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      {
        "name": "info",
        "type": "tuple",
        "internalType": "struct IStakeManager.DepositInfo",
        "components": [
          { "name": "deposit", "type": "uint256", "internalType": "uint256" },
          { "name": "staked", "type": "bool", "internalType": "bool" },
          { "name": "stake", "type": "uint112", "internalType": "uint112" },
          {
            "name": "unstakeDelaySec",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "withdrawTime",
            "type": "uint48",
            "internalType": "uint48"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNonce",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" },
      { "name": "key", "type": "uint192", "internalType": "uint192" }
    ],
    "outputs": [
      { "name": "nonce", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSenderAddress",
    "inputs": [
      { "name": "initCode", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserOpHash",
    "inputs": [
      {
        "name": "userOp",
        "type": "tuple",
        "internalType": "struct PackedUserOperation",
        "components": [
          { "name": "sender", "type": "address", "internalType": "address" },
          { "name": "nonce", "type": "uint256", "internalType": "uint256" },
          { "name": "initCode", "type": "bytes", "internalType": "bytes" },
          { "name": "callData", "type": "bytes", "internalType": "bytes" },
          {
            "name": "accountGasLimits",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "preVerificationGas",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "gasFees", "type": "bytes32", "internalType": "bytes32" },
          {
            "name": "paymasterAndData",
            "type": "bytes",
            "internalType": "bytes"
          },
          { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ]
      }
    ],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "handleAggregatedOps",
    "inputs": [
      {
        "name": "opsPerAggregator",
        "type": "tuple[]",
        "internalType": "struct IEntryPoint.UserOpsPerAggregator[]",
        "components": [
          {
            "name": "userOps",
            "type": "tuple[]",
            "internalType": "struct PackedUserOperation[]",
            "components": [
              {
                "name": "sender",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "nonce",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "initCode",
                "type": "bytes",
                "internalType": "bytes"
              },
              {
                "name": "callData",
                "type": "bytes",
                "internalType": "bytes"
              },
              {
                "name": "accountGasLimits",
                "type": "bytes32",
                "internalType": "bytes32"
              },
              {
                "name": "preVerificationGas",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "gasFees",
                "type": "bytes32",
                "internalType": "bytes32"
              },
              {
                "name": "paymasterAndData",
                "type": "bytes",
                "internalType": "bytes"
              },
              {
                "name": "signature",
                "type": "bytes",
                "internalType": "bytes"
              }
            ]
          },
          {
            "name": "aggregator",
            "type": "address",
            "internalType": "contract IAggregator"
          },
          { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ]
      },
      {
        "name": "beneficiary",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "handleOps",
    "inputs": [
      {
        "name": "ops",
        "type": "tuple[]",
        "internalType": "struct PackedUserOperation[]",
        "components": [
          { "name": "sender", "type": "address", "internalType": "address" },
          { "name": "nonce", "type": "uint256", "internalType": "uint256" },
          { "name": "initCode", "type": "bytes", "internalType": "bytes" },
          { "name": "callData", "type": "bytes", "internalType": "bytes" },
          {
            "name": "accountGasLimits",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "preVerificationGas",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "gasFees", "type": "bytes32", "internalType": "bytes32" },
          {
            "name": "paymasterAndData",
            "type": "bytes",
            "internalType": "bytes"
          },
          { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ]
      },
      {
        "name": "beneficiary",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "incrementNonce",
    "inputs": [
      { "name": "key", "type": "uint192", "internalType": "uint192" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "innerHandleOp",
    "inputs": [
      { "name": "callData", "type": "bytes", "internalType": "bytes" },
      {
        "name": "opInfo",
        "type": "tuple",
        "internalType": "struct EntryPoint.UserOpInfo",
        "components": [
          {
            "name": "mUserOp",
            "type": "tuple",
            "internalType": "struct EntryPoint.MemoryUserOp",
            "components": [
              {
                "name": "sender",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "nonce",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "verificationGasLimit",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "callGasLimit",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "paymasterVerificationGasLimit",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "paymasterPostOpGasLimit",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "preVerificationGas",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "paymaster",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "maxFeePerGas",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "maxPriorityFeePerGas",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "userOpHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          { "name": "prefund", "type": "uint256", "internalType": "uint256" },
          {
            "name": "contextOffset",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "preOpGas", "type": "uint256", "internalType": "uint256" }
        ]
      },
      { "name": "context", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [
      {
        "name": "actualGasCost",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "nonceSequenceNumber",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "uint192", "internalType": "uint192" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "unlockStake",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawStake",
    "inputs": [
      {
        "name": "withdrawAddress",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawTo",
    "inputs": [
      {
        "name": "withdrawAddress",
        "type": "address",
        "internalType": "address payable"
      },
      {
        "name": "withdrawAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AccountDeployed",
    "inputs": [
      {
        "name": "userOpHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "factory",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "paymaster",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BeforeExecution",
    "inputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Deposited",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "totalDeposit",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PostOpRevertReason",
    "inputs": [
      {
        "name": "userOpHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "revertReason",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SignatureAggregatorChanged",
    "inputs": [
      {
        "name": "aggregator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakeLocked",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "totalStaked",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "unstakeDelaySec",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakeUnlocked",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "withdrawTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakeWithdrawn",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "withdrawAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UserOperationEvent",
    "inputs": [
      {
        "name": "userOpHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "paymaster",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "success",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "actualGasCost",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "actualGasUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UserOperationPrefundTooLow",
    "inputs": [
      {
        "name": "userOpHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UserOperationRevertReason",
    "inputs": [
      {
        "name": "userOpHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "revertReason",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "withdrawAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "DelegateAndRevert",
    "inputs": [
      { "name": "success", "type": "bool", "internalType": "bool" },
      { "name": "ret", "type": "bytes", "internalType": "bytes" }
    ]
  },
  {
    "type": "error",
    "name": "FailedOp",
    "inputs": [
      { "name": "opIndex", "type": "uint256", "internalType": "uint256" },
      { "name": "reason", "type": "string", "internalType": "string" }
    ]
  },
  {
    "type": "error",
    "name": "FailedOpWithRevert",
    "inputs": [
      { "name": "opIndex", "type": "uint256", "internalType": "uint256" },
      { "name": "reason", "type": "string", "internalType": "string" },
      { "name": "inner", "type": "bytes", "internalType": "bytes" }
    ]
  },
  {
    "type": "error",
    "name": "PostOpReverted",
    "inputs": [
      { "name": "returnData", "type": "bytes", "internalType": "bytes" }
    ]
  },
  { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] },
  {
    "type": "error",
    "name": "SenderAddressResult",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "SignatureValidationFailed",
    "inputs": [
      { "name": "aggregator", "type": "address", "internalType": "address" }
    ]
  }
]

export const factoryCardsAbi: Abi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_entryPoint",
        "type": "address",
        "internalType": "contract IEntryPoint"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "CARD_IMPLEMENTATION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract LoyaltyCard"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createAccount",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      {
        "name": "loyaltyProgram",
        "type": "address",
        "internalType": "address payable"
      },
      { "name": "salt", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "newCard",
        "type": "address",
        "internalType": "contract LoyaltyCard"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAddress",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      {
        "name": "loyaltyProgram",
        "type": "address",
        "internalType": "address payable"
      },
      { "name": "salt", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  { "type": "error", "name": "FactoryCards__NotRegisteredCard", "inputs": [] }
]


export const loyaltyCardAbi: Abi  = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "anEntryPoint",
        "type": "address",
        "internalType": "contract IEntryPoint"
      }
    ],
    "stateMutability": "nonpayable"
  },
  { "type": "receive", "stateMutability": "payable" },
  {
    "type": "function",
    "name": "UPGRADE_INTERFACE_VERSION",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "entryPoint",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IEntryPoint"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      { "name": "dest", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" },
      { "name": "func", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getNonce",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      { "name": "anOwner", "type": "address", "internalType": "address" },
      {
        "name": "loyaltyProgram",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "onERC721Received",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "uint256", "internalType": "uint256" },
      { "name": "", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "proxiableUUID",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ret",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes", "internalType": "bytes" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "s_loyaltyProgram",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address payable" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "s_owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "upgradeToAndCall",
    "inputs": [
      {
        "name": "newImplementation",
        "type": "address",
        "internalType": "address"
      },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "validateUserOp",
    "inputs": [
      {
        "name": "userOp",
        "type": "tuple",
        "internalType": "struct PackedUserOperation",
        "components": [
          { "name": "sender", "type": "address", "internalType": "address" },
          { "name": "nonce", "type": "uint256", "internalType": "uint256" },
          { "name": "initCode", "type": "bytes", "internalType": "bytes" },
          { "name": "callData", "type": "bytes", "internalType": "bytes" },
          {
            "name": "accountGasLimits",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "preVerificationGas",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "gasFees", "type": "bytes32", "internalType": "bytes32" },
          {
            "name": "paymasterAndData",
            "type": "bytes",
            "internalType": "bytes"
          },
          { "name": "signature", "type": "bytes", "internalType": "bytes" }
        ]
      },
      { "name": "userOpHash", "type": "bytes32", "internalType": "bytes32" },
      {
        "name": "missingAccountFunds",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "validationData",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawDepositTo",
    "inputs": [
      {
        "name": "withdrawAddress",
        "type": "address",
        "internalType": "address payable"
      },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Initialized",
    "inputs": [
      {
        "name": "version",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyCardCreated",
    "inputs": [
      {
        "name": "entryPoint",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "loyaltyProgram",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Upgraded",
    "inputs": [
      {
        "name": "implementation",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      { "name": "target", "type": "address", "internalType": "address" }
    ]
  },
  { "type": "error", "name": "ECDSAInvalidSignature", "inputs": [] },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureLength",
    "inputs": [
      { "name": "length", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureS",
    "inputs": [{ "name": "s", "type": "bytes32", "internalType": "bytes32" }]
  },
  {
    "type": "error",
    "name": "ERC1967InvalidImplementation",
    "inputs": [
      {
        "name": "implementation",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  { "type": "error", "name": "ERC1967NonPayable", "inputs": [] },
  { "type": "error", "name": "FailedInnerCall", "inputs": [] },
  { "type": "error", "name": "InvalidInitialization", "inputs": [] },
  {
    "type": "error",
    "name": "LoyaltyCard__FailedOp",
    "inputs": [
      { "name": "reason", "type": "string", "internalType": "string" }
    ]
  },
  { "type": "error", "name": "NotInitializing", "inputs": [] },
  { "type": "error", "name": "UUPSUnauthorizedCallContext", "inputs": [] },
  {
    "type": "error",
    "name": "UUPSUnsupportedProxiableUUID",
    "inputs": [
      { "name": "slot", "type": "bytes32", "internalType": "bytes32" }
    ]
  }
]

export const factoryProgramsAbi: Abi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "entryPoint", "type": "address", "internalType": "address" },
      { "name": "factoryCards", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ENTRY_POINT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FACTORY_CARDS",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deployLoyaltyProgram",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "colourScheme", "type": "string", "internalType": "string" },
      { "name": "cardImageUri", "type": "string", "internalType": "string" }
    ],
    "outputs": [
      {
        "name": "loyaltyProgram",
        "type": "address",
        "internalType": "contract LoyaltyProgram"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "FactoryProgramsDeployed",
    "inputs": [
      {
        "name": "entryPoint",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "factoryCards",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProgramDeployed",
    "inputs": [
      {
        "name": "program",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  }
]

export const loyaltyProgramAbi: Abi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "colourScheme", "type": "string", "internalType": "string" },
      { "name": "cardImageUri", "type": "string", "internalType": "string" },
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "entryPoint", "type": "address", "internalType": "address" },
      { "name": "cardsFactory", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  { "type": "fallback", "stateMutability": "payable" },
  { "type": "receive", "stateMutability": "payable" },
  {
    "type": "function",
    "name": "CARD_FACTORY",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ENTRY_POINT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowCreationCards",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "spender", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowedGifts",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [
      { "name": "redeemable", "type": "bool", "internalType": "bool" },
      { "name": "exchangeable", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "allowedGiftsArray",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "entryPoint",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IEntryPoint"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "exchangePointsForGift",
    "inputs": [
      { "name": "gift", "type": "address", "internalType": "address" },
      { "name": "caller", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllowedGifts",
    "inputs": [],
    "outputs": [
      {
        "name": "allowedGifts",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "imageUri",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mintGifts",
    "inputs": [
      { "name": "gift", "type": "address", "internalType": "address" },
      { "name": "amount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "onERC721Received",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "address", "internalType": "address" },
      { "name": "", "type": "uint256", "internalType": "uint256" },
      { "name": "", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "payCardPrefund",
    "inputs": [
      {
        "name": "missingAccountFunds",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "originalSender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      { "name": "success", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "redeemGift",
    "inputs": [
      { "name": "program", "type": "address", "internalType": "address" },
      { "name": "ownerCard", "type": "address", "internalType": "address" },
      { "name": "gift", "type": "address", "internalType": "address" },
      { "name": "giftId", "type": "uint256", "internalType": "uint256" },
      {
        "name": "uniqueNumber",
        "type": "uint256",
        "internalType": "uint256"
      },
      { "name": "signature", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "requestPoints",
    "inputs": [
      { "name": "program", "type": "address", "internalType": "address" },
      { "name": "points", "type": "uint256", "internalType": "uint256" },
      {
        "name": "uniqueNumber",
        "type": "uint256",
        "internalType": "uint256"
      },
      { "name": "ownerCard", "type": "address", "internalType": "address" },
      { "name": "programSignature", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "s_executed",
    "inputs": [{ "name": "", "type": "bytes", "internalType": "bytes" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setAllowCreationCards",
    "inputs": [{ "name": "allowed", "type": "bool", "internalType": "bool" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setAllowedGift",
    "inputs": [
      { "name": "gift", "type": "address", "internalType": "address" },
      { "name": "exchangeable", "type": "bool", "internalType": "bool" },
      { "name": "redeemable", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setCardBlocked",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "blocked", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setImageUri",
    "inputs": [
      { "name": "imageUri", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferGift",
    "inputs": [
      { "name": "customer", "type": "address", "internalType": "address" },
      { "name": "gift", "type": "address", "internalType": "address" },
      { "name": "giftId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AllowedGiftSet",
    "inputs": [
      {
        "name": "loyaltyGift",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "exchangeable",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
      },
      {
        "name": "redeemable",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CreationCardsAllowed",
    "inputs": [
      {
        "name": "allowed",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GiftTransferred",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "gift",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "giftId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GiftsMinted",
    "inputs": [
      {
        "name": "gift",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ImageUriChanged",
    "inputs": [],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Log",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "func",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyCardBlocked",
    "inputs": [
      {
        "name": "customer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "blocked",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyGiftRedeemed",
    "inputs": [
      {
        "name": "customer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "gift",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "giftId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyPointsExchangeForGift",
    "inputs": [
      {
        "name": "customer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "gift",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "giftId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyProgramDeployed",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "program",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  { "type": "error", "name": "ECDSAInvalidSignature", "inputs": [] },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureLength",
    "inputs": [
      { "name": "length", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureS",
    "inputs": [{ "name": "s", "type": "bytes32", "internalType": "bytes32" }]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientAllowance",
    "inputs": [
      { "name": "spender", "type": "address", "internalType": "address" },
      { "name": "allowance", "type": "uint256", "internalType": "uint256" },
      { "name": "needed", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientBalance",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" },
      { "name": "balance", "type": "uint256", "internalType": "uint256" },
      { "name": "needed", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidApprover",
    "inputs": [
      { "name": "approver", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidReceiver",
    "inputs": [
      { "name": "receiver", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSender",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSpender",
    "inputs": [
      { "name": "spender", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__AlreadyExecuted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__BlockedLoyaltyCard",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__CardDoesNotOwnGift",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__GiftAddressAndArrayDoNotAlign",
    "inputs": []
  },
  { "type": "error", "name": "LoyaltyProgram__GiftAlreadySet", "inputs": [] },
  {
    "type": "error",
    "name": "LoyaltyProgram__GiftExchangeFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__GiftNotExchangeable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__GiftNotRedeemable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__IncorrectInterface",
    "inputs": [
      { "name": "gift", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__MoreThanMaxIncrease",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__NotRegisteredCard",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__NotSignedByOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyProgram__OLoyaltyProgram__NoZeroAddressnlyLoyaltyCard",
    "inputs": []
  },
  { "type": "error", "name": "LoyaltyProgram__OnlyCardHolder", "inputs": [] },
  { "type": "error", "name": "LoyaltyProgram__OnlyEntryPoint", "inputs": [] },
  {
    "type": "error",
    "name": "LoyaltyProgram__RequestNotFromProgramOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ]
  }
]

export const loyaltyGiftAbi: Abi = [
  { "type": "fallback", "stateMutability": "nonpayable" },
  {
    "type": "function",
    "name": "GIFT_COST",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "HAS_ADDITIONAL_REQUIREMENTS",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "i_uri",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "operator", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "requirementsExchangeMet",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address payable" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "requirementsRedeemMet",
    "inputs": [
      { "name": "", "type": "address", "internalType": "address payable" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "retrieveGiftFromCard",
    "inputs": [
      { "name": "_card", "type": "address", "internalType": "address" },
      { "name": "_giftId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "success", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeMint",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      { "name": "from", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      { "name": "from", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
      { "name": "data", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      { "name": "operator", "type": "address", "internalType": "address" },
      { "name": "approved", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenByIndex",
    "inputs": [
      { "name": "index", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenOfOwnerByIndex",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "index", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferGift",
    "inputs": [
      { "name": "card", "type": "address", "internalType": "address" },
      { "name": "giftId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "success", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ApprovalForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BatchMetadataUpdate",
    "inputs": [
      {
        "name": "_fromTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "_toTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoyaltyGiftDeployed",
    "inputs": [
      {
        "name": "giftAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MetadataUpdate",
    "inputs": [
      {
        "name": "_tokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ERC721EnumerableForbiddenBatchMint",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ERC721IncorrectOwner",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
      { "name": "owner", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InsufficientApproval",
    "inputs": [
      { "name": "operator", "type": "address", "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidApprover",
    "inputs": [
      { "name": "approver", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidOperator",
    "inputs": [
      { "name": "operator", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidOwner",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidReceiver",
    "inputs": [
      { "name": "receiver", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidSender",
    "inputs": [
      { "name": "sender", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721NonexistentToken",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ]
  },
  {
    "type": "error",
    "name": "ERC721OutOfBoundsIndex",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "index", "type": "uint256", "internalType": "uint256" }
    ]
  },
  { "type": "error", "name": "EnforcedPause", "inputs": [] },
  { "type": "error", "name": "ExpectedPause", "inputs": [] },
  { "type": "error", "name": "LoyaltyGift_CardDoesNotOwnGift", "inputs": [] },
  {
    "type": "error",
    "name": "LoyaltyGift_ProgramDoesNotOwnGift",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyGift_UnrecognisedFunctionCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LoyaltyGift__IncorrectInterface",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ]
  }
]
