"use client"
import { entryPointAbi, factoryCardsAbi, factoryProgramsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient, publicClient, client } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints, Status } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { SignTypedDataParams, usePrivy, useWallets } from "@privy-io/react-auth"
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, getSenderAddress, parseAccount, signUserOperationHashWithECDSA, UserOperation, walletClientToSmartAccountSigner } from "permissionless"
import { signerToSimpleSmartAccount } from "permissionless/accounts"
import { useCallback, useEffect, useRef, useState } from "react"
import { Abi, Account, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex, http, createWalletClient, custom, EIP1193Provider, ByteArray, SignableMessage, concat, toBytes, Address, Client, Prettify, pad, parseAbi, hexToBytes } from "viem"
import { EntryPointVersion, getUserOperationHash, PackedUserOperation, SmartAccount, SmartAccountImplementation, toPackedUserOperation, ToSmartAccountReturnType } from "viem/account-abstraction"
import { foundry } from "viem/chains"
import { useReadContract, useReadContracts, useSignTypedData, useWalletClient } from "wagmi"
import { SignTypedDataData } from "wagmi/query"
import { toSmartAccount } from 'viem/account-abstraction'
import { env } from "process"
import { toLoyaltyCardAccount } from "@/utils/toLoyaltyCardAccount"

// 
// See the docs at: https://docs.privy.io/guide/react/recipes/account-abstraction/pimlico 
// https://viem.sh/account-abstraction/accounts/smart/toSmartAccount
// see  account-abstraction/accounts/implementations/toSoladySmartAccounts.ts for an example implementation. 
// 

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

export const useLoyaltyCard = () => { // here types can be added: "exchangePoints", etc 
  const [error, setError] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [loyaltyCard, setLoyaltyCard] = useState<ToSmartAccountReturnType>(); 
  const [userOp, setUserOp] = useState<UserOperation<"v0.7">>(); 

  console.log("error: ", error)

  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {signMessage} = usePrivy();
  const {wallets, ready: walletsReady} = useWallets();
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  console.log("userOp: ", userOp); 

  const fetchLoyaltyCard = useCallback(
    async (
      loyaltyProgram: `0x${string}`, 
      salt: `0x${string}`,
      cardAddress?: `0x${string}` | null | undefined, 
    ) => {
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

      const entryPoint = {
        abi: entryPointAbi,
        address: ENTRYPOINT_ADDRESS_V07,
        version: '0.7'
      } as const
      const factory = {
        abi: factoryCardsAbi,
        address:  process.env.NEXT_PUBLIC_CARDS_FACTORY,
      } as const

      const owner = parseAccount(embeddedWallet.address as `0x${string}`)

      setIsLoading(true);
      setError(null);

      const account = await toSmartAccount({
        address: cardAddress, 
        client: client,
        entryPoint: {
          abi: entryPointAbi,
          address: prog.entryPoint, // change later to public constant. 
          version: '0.7',
        }, 
        extend: { entryPointAbi, factory },
        
        // Encode calls as defined by the Smart Account contract.
        async encodeCalls(calls): Promise<`0x${string}`> {
          if (calls.length > 1) {
            setError("LoyaltyCard only supports single calls"); // should actually exit function. Implement later. 
          } 
          console.log("calls:", calls)
          try {
            return encodeFunctionData({
              abi: entryPointAbi,
              functionName: 'execute',
              args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? '0x'],
            })
            } catch(error) {
              setError(`Error @encodeCalls: ${error}`)
              return '0x'
            }
        }, 

        // Get the address of the Smart Account.
        async getAddress(): Promise<`0x${string}`> {
          if (cardAddress) return cardAddress

          try { 
            const cardAddress = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
              abi: factoryCardsAbi,
              functionName: 'getAddress',
              args: [embeddedWallet.address, loyaltyProgram, pad(salt)]
            })
            return cardAddress as `0x${string}`
          } catch(error) {
            setError(`Error @getAddress: ${error}`)
            return '0x'
          }
        },

        // Build the Factory properties for the Smart Account.
        async getFactoryArgs(): Promise<{ factory?: `0x${string}` | undefined; factoryData?: `0x${string}` | undefined}> {
            try { 
              const factoryData = encodeFunctionData({
                abi: factory.abi,
                functionName: 'createAccount',
                args: [owner.address, prog.address, pad(salt)],
              })
              return { factory: factory.address as `0x${string}`, factoryData }
            } catch(error) {
              setError(`Error @getFactoryArgs: ${error}`)
              return { factory: '0x', factoryData: '0x' }
            }
        },

        // Get the nonce of the Smart Account.
        async getNonce({ key = 0n } = {}): Promise<bigint>  {
          try {
            const address = await this.getAddress()
            const nonce = await publicClient.readContract({
              address: entryPoint.address,
              abi: loyaltyCardAbi,
              functionName: 'getNonce', 
              args: [address, key],
            })

            return nonce as bigint
          } catch (error) {
            setError(`Error @getNonce: ${error}`)
            return 0n
          }
        },

         // Get the stub signature for User Operations from the Smart Account.
        async getStubSignature() {
            return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
        },

        // Sign message to be verified by the Smart Account contract.
        // note: at toSoldarySmartAccount they implement this with a signMessage. 
        // I think I have to do it differently because of using privy. 
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
        
        // Sign a User Operation to be broadcasted via the Bundler.
        // NB! in toSoldadySmartAccount example. This is a simple sign message! NOT typedData! 
        async signUserOperation(userOperation): Promise<`0x${string}`> {
          const cardAddress = await this.getAddress()

          const userOpHash = getUserOperationHash({
            chainId: 31337, // chainId,
            entryPointAddress: entryPoint.address,
            entryPointVersion: entryPoint.version,
            userOperation: {
              ...(userOperation as any),
              sender: cardAddress,
            },
          })
          console.log("viems userOpHash:", userOpHash)

          try {
            const uiConfig = {
              title: 'Sample title text',
              description: 'Sample description text',
              buttonText: 'Sample button text',
            };
            const signature = await signMessage(userOpHash, uiConfig);

            return signature as `0x${string}`
          } catch (error) {
            setError(`Error @signUserOperation: ${error}`)
            return '0x11'
          }
        },
      })

      setIsLoading(false)
      setLoyaltyCard(account)

    }, [])

    const createUserOp = useCallback(
      async (functionName: string, args: any[], salt: `0x${string}`) => {
        const callGasLimit: bigint = 75900n
        const preVerificationGas: bigint = 247487n
        const verificationGasLimit: bigint = 526114n
  
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


        console.log("fetchedGasPrice.standard.maxFeePerGas: ", fetchedGasPrice.standard.maxFeePerGas)
        console.log("preVerificationGas: ", preVerificationGas)
        const owner = parseAccount(embeddedWallet.address as `0x${string}`)
        const entryPoint = {
          abi: entryPointAbi,
          address: ENTRYPOINT_ADDRESS_V07,
          version: '0.7'
        } as const
        const factory = {
          abi: factoryCardsAbi,
          address:  process.env.NEXT_PUBLIC_CARDS_FACTORY,
        } as const
        const key = 0n; 
        const factoryData = encodeFunctionData({
          abi: factory.abi,
          functionName: 'createAccount',
          args: [owner.address, prog.address, pad(salt)],
        })

        let nonce; 
        let cardAddress;
        
        try {
          cardAddress = await publicClient.readContract({
            address: process.env.NEXT_PUBLIC_CARDS_FACTORY as `0x${string}`,
            abi: factoryCardsAbi,
            functionName: 'getAddress',
            args: [embeddedWallet.address, prog.address, pad(salt)]
          })

          console.log("address @createUserOp", cardAddress)
          
          try {
            nonce = await publicClient.readContract({
              address: entryPoint.address,
              abi: loyaltyCardAbi,
              functionName: 'getNonce', 
              args: [cardAddress, key],
            })
          } catch {
            nonce = 0n
          } 

          console.log("nonce @createUserOp", nonce)

          const callData = encodeFunctionData({
            abi: loyaltyProgramAbi,
            functionName: functionName, 
            args: args
          })

          console.log("callData @createUserOp", callData)

          const userOperation: UserOperation<"v0.7"> = {
            /** The data to pass to the `sender` during the main execution call. */
            callData: callData,
            /** The amount of gas to allocate the main execution call */
            callGasLimit: callGasLimit, 
            /** Account factory. Only for new accounts. */
            factory: factory.address as `0x${string}`,
            /** Data for account factory. */
            factoryData: factoryData, 
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
            paymasterPostOpGasLimit: 0n, 
            /** The amount of gas to allocate for the paymaster validation code. */
            paymasterVerificationGasLimit: 0n, 
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
          return userOperation

        } catch (error) {
          setError(`Error @createUserOp: ${error}`)
        }
    }, [])

    const sendUserOp = useCallback(
      async (loyaltyCard: ToSmartAccountReturnType, functionName: string, args: any[], salt: `0x${string}`) => {
        console.log("sendUserOp called")

        const userOperation = await createUserOp(functionName, args, salt);
        if (userOperation) {
          const signature = await loyaltyCard.signUserOperation(userOperation);
          const userOpSigned = {...userOperation, signature: signature} 
  
          const hash = await bundlerClient.sendUserOperation({userOperation: userOpSigned}) 
          console.log("HASH: ", hash)     
        } else {
          Error("sendUserOp: userOperation did not come through")
        }
      }, [])

    return { fetchLoyaltyCard, loyaltyCard, isLoading, error, createUserOp, userOp, sendUserOp};
  
  }

