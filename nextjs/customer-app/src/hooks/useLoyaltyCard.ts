"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient, publicClient } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints, Status } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { usePrivyWagmi } from "@privy-io/wagmi"
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, getSenderAddress, parseAccount, signUserOperationHashWithECDSA, UserOperation, walletClientToSmartAccountSigner } from "permissionless"
import { signerToSimpleSmartAccount } from "permissionless/accounts"
import { useCallback, useEffect, useRef, useState } from "react"
import { Abi, Account, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex, http, createWalletClient, custom, EIP1193Provider, ByteArray, SignableMessage, concat, toBytes } from "viem"
import { PackedUserOperation, SmartAccount, SmartAccountImplementation, toPackedUserOperation, ToSmartAccountReturnType } from "viem/account-abstraction"
import { foundry } from "viem/chains"
import { useReadContract, useReadContracts, useSignTypedData, useWalletClient } from "wagmi"
import { SignTypedDataData } from "wagmi/query"
import { toSmartAccount } from 'viem/account-abstraction'
import { signMessage } from "viem/accounts"

// 
// See the docs at: https://docs.privy.io/guide/react/recipes/account-abstraction/pimlico 
// https://viem.sh/account-abstraction/accounts/smart/toSmartAccount
// 

type EncodeRequestPointsAndCardProps = { 
  program: Hex;
  points: bigint;  
  uniqueNumber: bigint;  
  signature: Hex; 
}

type gasPriceProps = {
  slow: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
};
  standard: {
      maxFeePerGas: bigint;
      maxPriorityFeePerGas: bigint;
  };
  fast: {
      maxFeePerGas: bigint;
      maxPriorityFeePerGas: bigint;
  };
}

type sendUserOpProps = { 
  abi: Abi;
  functionName: string;  
  args: Array<bigint | string | Hex >; 
}

const types = {
  userOpHash: [
    { name: 'digest', type: 'bytes32' }
  ],
} as const

export const useLoyaltyCard = () => { // here types can be added: "exchangePoints", etc 
  const [error, setError] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [loyaltyCard, setLoyaltyCard] = useState<ToSmartAccountReturnType>(); 
  const [userOp, setUserOp] = useState<UserOperation<"v0.7">>(); 

  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  const fetchLoyaltyCard = useCallback(
    async (loyaltyProgram: `0x${string}`, salt: bigint) => {
      if (!publicClient) {
        setError("No publicClient available");
        return;
      }
      if (!prog.entryPoint) {
        setError("No entryPoint available");
        return;
      }
      if (!embeddedWallet) {
        setError("No embedded Wallet available");
        return;
      }

      setIsLoading(true);
      setError(null);

      const account = await toSmartAccount({
        client: publicClient,
        entryPoint: {
          abi: entryPointAbi,
          address: prog.entryPoint, // change later to public constant. 
          version: '0.7',
        },
        
        // Encode calls as defined by the Smart Account contract.
        async encodeCalls(calls): Promise<`0x${string}`> {
          if (calls.length > 1) {
            setError("LoyaltyCard only supports single calls"); // should actually exit function. Implement later. 
          } 
          try {
            const cardAddress = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
              abi: factoryCardsAbi,
              functionName: 'getAddress',
              args: [embeddedWallet.address, loyaltyProgram, salt]
            })
              
            const encodedCallData = encodeFunctionData({
                abi: loyaltyCardAbi,
                functionName: 'execute', 
                args: [
                  cardAddress,
                  0n, // cards never send any value. period. 
                  calls[0] // cards can only send one call at a time.  
                ]
              })
              return encodedCallData
            } catch(error) {
              setError(`Error @encodeCalls: ${error}`)
              return '0x'
            }
        }, 

        // Get the address of the Smart Account.
        async getAddress(): Promise<`0x${string}`> {
          try { 
            const cardAddress = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
              abi: factoryCardsAbi,
              functionName: 'getAddress',
              args: [embeddedWallet.address, loyaltyProgram, salt]
            })
            return cardAddress as `0x${string}`
          } catch(error) {
            setError(`Error @getAddress: ${error}`)
            return '0x'
          }
        },

        // Build the Factory properties for the Smart Account.
        async getFactoryArgs(): Promise<{ factory?: `0x${string}` | undefined; factoryData?: `0x${string}` | undefined}> {
            return {
              factory: '0x', 
              factoryData: '0x'
            }
        },

        // Get the nonce of the Smart Account.
        async getNonce(): Promise<bigint>  {
          try {
            const cardAddress = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
              abi: factoryCardsAbi,
              functionName: 'getAddress',
              args: [embeddedWallet.address, loyaltyProgram, salt]
            })

            const nonce = await publicClient.readContract({
              address: cardAddress as `0x${string}`,
              abi: loyaltyCardAbi,
              functionName: 'getNonce',
              args: [salt]
            })

            return nonce as bigint
          } catch (error) {
            setError(`Error @getNonce: ${error}`)
            return 0n
          }
        },

        // Sign message to be verified by the Smart Account contract.
        async signMessage(message): Promise<`0x${string}`>  {
          try {
            const provider = await embeddedWallet.getEthereumProvider();
            const address = embeddedWallet.address
            const signature = await provider.request({
              method: 'personal_sign',
              params: [message, address],
            });
            return signature
          } catch (error) {
            setError(`Error @signMessage: ${error}`)
            return '0x'
          }
        },
        
        // Sign typed data to be verified by the Smart Account contract.
        async signTypedData(typedData): Promise<`0x${string}`> {
          try {
            const provider = await embeddedWallet.getEthereumProvider();
            const address = embeddedWallet.address
            const signature = await provider.request({
              method: 'eth_signTypedData_v4',
              params: [address, typedData],
            });
            return signature
          } catch (error) {
            setError(`Error @signTypedData: ${error}`)
            return '0x'
          }
        },
        
        // Get the stub signature for User Operations from the Smart Account.
        async getStubSignature(): Promise<`0x${string}`> {
          try {
            // const fetchedGasPrice: gasPriceProps = await bundlerClient.getUserOperationGasPrice() 
            const provider = await embeddedWallet.getEthereumProvider();
            const walletAddress = embeddedWallet.address
  
            // NB! creating stub data // is this what it is supposed to do? 
            const packedUserOp: PackedUserOperation = {
              accountGasLimits: '0x', 
              callData: '0x', 
              initCode: '0x',
              gasFees: '0x', 
              nonce: 0n, // or should this still be dynamic? 
              paymasterAndData: '0x', 
              preVerificationGas: 0n,
              sender: '0x',
              signature: '0x'
            }
  
            const userOpHash = await publicClient.readContract({
              address: prog.entryPoint as `0x${string}`,
              abi: entryPointAbi,
              functionName: 'getUserOpHash',
              args: [packedUserOp]
            })
  
            const typedUserOpHash = { // I hope this is correct - let's see.. 
              types, 
              primaryType: 'userOpHash',
              userOpHash  
            }
            
            const signature = await provider.request({
              method: 'eth_signTypedData_v4',
              params: [walletAddress, typedUserOpHash]
            });
  
            return signature as `0x${string}`
            } catch (error) {
              setError(`Error @signTypedData: ${error}`)
              return '0x'
            }
        },

        // Sign a User Operation to be broadcasted via the Bundler.
        async signUserOperation(userOperation): Promise<`0x${string}`> {
          try {
            const provider = await embeddedWallet.getEthereumProvider();
            const walletAddress = embeddedWallet.address

            const cardAddress = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
              abi: factoryCardsAbi,
              functionName: 'getAddress',
              args: [embeddedWallet.address, loyaltyProgram, salt]
            })

            const nonce = await publicClient.readContract({
              address: cardAddress as `0x${string}`,
              abi: loyaltyCardAbi,
              functionName: 'getNonce',
              args: [salt]
            })

            // NB! converting the UserOperation object to a PackedUserOperation object. 
            const packedUserOp: PackedUserOperation = {
              /** Concatenation of {@link UserOperation`verificationGasLimit`} (16 bytes) and {@link UserOperation`callGasLimit`} (16 bytes) */
              accountGasLimits: concat([
                numberToHex(userOperation.verificationGasLimit, {size: 16}), 
                numberToHex(userOperation.callGasLimit, {size: 16}),
                ]), 
              /** The data to pass to the `sender` during the main execution call. */
              callData: userOperation.callData, 
              /** Concatenation of {@link UserOperation`factory`} and {@link UserOperation`factoryData`}. */
              initCode: concat([
                userOperation.factory ? userOperation.factory : '0x', 
                userOperation.factoryData ? userOperation.factoryData : '0x'
              ]),
              /** Concatenation of {@link UserOperation`maxPriorityFee`} (16 bytes) and {@link UserOperation`maxFeePerGas`} (16 bytes) */
              gasFees: concat([
                numberToHex(userOperation.maxPriorityFeePerGas, {size: 16}), 
                numberToHex(userOperation.maxFeePerGas, {size: 16}),
                ]), 
              /** Anti-replay parameter. */
              nonce: nonce as bigint, 
              /** Concatenation of paymaster fields (or empty). */
              paymasterAndData: '0x', 
              /** Extra gas to pay the bunder. */
              preVerificationGas: userOperation.preVerificationGas,
              /** The account making the operation. */
              sender: userOperation.sender  as `0x${string}`,
              /** Data passed into the account to verify authorization. */
              signature: '0x'
            }

            const userOpHash = await publicClient.readContract({
              address: prog.entryPoint as `0x${string}`,
              abi: entryPointAbi,
              functionName: 'getUserOpHash',
              args: [packedUserOp]
            })

            const typedUserOpHash = { // I hope this is correct - let's see.. 
              types, 
              primaryType: 'userOpHash',
              userOpHash  
            }
            
            const signature = await provider.request({
              method: 'eth_signTypedData_v4',
              params: [walletAddress, typedUserOpHash]
            });

            return signature as `0x${string}`
          } catch (error) {
            setError(`Error @signTypedData: ${error}`)
            return '0x'
          }
        },
       
        // (Optional) Extend the Smart Account with custom properties.
        // extend: {
        //   abi: [/* ... */],
        //   factory: {
        //     abi: [/* ... */],
        //     address: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
        //   },
        // },
        // (Optional) User Operation configuration.
        // userOperation: {
        //   async estimateGas(userOperation) {
        //     // Estimate gas properties for a User Operation.
        //   },
        // },
      })

      setIsLoading(false)
      setLoyaltyCard(account)

    }, [])

    const createUserOp = useCallback(
      async (functionName: string, args: any[]) => {
        const callGasLimit: bigint = 75900n
        const preVerificationGas: bigint = 247487n
        const verificationGasLimit: bigint = 526114n
        const salt: bigint = 123456n 

        if (!publicClient) {
          setError("No publicClient available");
          return;
        }
        if (!prog.entryPoint) {
          setError("No entryPoint available");
          return;
        }
        if (!embeddedWallet) {
          setError("No embedded Wallet available");
          return;
        }

        setIsLoading(true);
        setError(null);
        
        const fetchedGasPrice: gasPriceProps = await bundlerClient.getUserOperationGasPrice() 
        
        try {
          const cardAddress = await publicClient.readContract({
            address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
            abi: factoryCardsAbi,
            functionName: 'getAddress',
            args: [embeddedWallet.address, prog.address, salt]
          })

          const nonce = await publicClient.readContract({
            address: cardAddress as `0x${string}`,
            abi: loyaltyCardAbi,
            functionName: 'getNonce'
          })

          const callData = encodeFunctionData({
            abi: loyaltyProgramAbi,
            functionName: functionName, 
            args: args
          })

          const userOperation: UserOperation<"v0.7"> = {
            /** The data to pass to the `sender` during the main execution call. */
            callData: callData,
            /** The amount of gas to allocate the main execution call */
            callGasLimit: callGasLimit, 
            /** Account factory. Only for new accounts. */
            factory: undefined,
            /** Data for account factory. */
            factoryData: undefined, 
            /** Maximum fee per gas. */
            maxFeePerGas: fetchedGasPrice.standard.maxFeePerGas,
            /** Maximum priority fee per gas. */
            maxPriorityFeePerGas: fetchedGasPrice.standard.maxPriorityFeePerGas,
            /** Anti-replay parameter. */
            nonce: nonce as bigint, 
            /** Address of paymaster contract. */
            paymaster: undefined, 
            /** Data for paymaster. */
            paymasterData: undefined, 
            /** The amount of gas to allocate for the paymaster post-operation code. */
            paymasterPostOpGasLimit: undefined, 
            /** The amount of gas to allocate for the paymaster validation code. */
            paymasterVerificationGasLimit: undefined, 
            /** Extra gas to pay the bunder. */
            preVerificationGas: preVerificationGas, 
            /** The account making the operation. */
            sender: cardAddress as `0x${string}`,
            /** Data passed into the account to verify authorization. */
            signature: '0x',
            /** The amount of gas to allocate for the verification step. */
            verificationGasLimit: verificationGasLimit
          }

          setUserOp(userOperation)

        } catch (error) {
          setError(`Error @createUserOp: ${error}`)
        }
    }, [])

    return { fetchLoyaltyCard, loyaltyCard, isLoading, error, createUserOp, userOp};
  
  }

