"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { generalBundlerClient, publicClient, client } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { QrPoints, Status } from "@/types"
import { parseBigInt, parseEthAddress, parseHex } from "@/utils/parsers"
import { ConnectedWallet, SignTypedDataParams, usePrivy, useWallets } from "@privy-io/react-auth"
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, getSenderAddress, parseAccount, signUserOperationHashWithECDSA, UserOperation, walletClientToSmartAccountSigner } from "permissionless"
import { signerToSimpleSmartAccount } from "permissionless/accounts"
import { useCallback, useEffect, useRef, useState } from "react"
import { Abi, Account, encodeFunctionData, encodePacked, Hex, hexToBigInt, numberToBytes, numberToHex, http, createWalletClient, custom, EIP1193Provider, ByteArray, SignableMessage, concat, toBytes, Address, Client, Prettify, pad, parseAbi, hexToBytes } from "viem"
import { EntryPointVersion, PackedUserOperation, SmartAccount, SmartAccountImplementation, toPackedUserOperation, ToSmartAccountReturnType } from "viem/account-abstraction"
import { foundry } from "viem/chains"
import { useReadContract, useReadContracts, useSignTypedData, useWalletClient } from "wagmi"
import { SignTypedDataData } from "wagmi/query"
import { toSmartAccount } from 'viem/account-abstraction'
import { signMessage } from "viem/accounts"
import { env } from "process"

// 
// See the docs at: https://docs.privy.io/guide/react/recipes/account-abstraction/pimlico 
// https://viem.sh/account-abstraction/accounts/smart/toSmartAccount
// see  account-abstraction/accounts/implementations/toSoladySmartAccounts.ts for an example implementation. 
// 

export const toLoyaltyCardAccount = async (
  embeddedWallet:  ConnectedWallet,
  loyaltyProgram: `0x${string}`, 
  salt: `0x${string}`
): Promise<SmartAccount>  => { // here types can be added: "exchangePoints", etc 

  const entryPoint = {
    abi: entryPointAbi,
    address: ENTRYPOINT_ADDRESS_V07,
    version: '0.7'
  } as const
  const factory = {
    abi: factoryCardsAbi,
    address:  process.env.NEXT_PUBLIC_CARDS_FACTORY,
  } as const
  const owner = embeddedWallet.address

  // using hooks on a function is not a good idea... It is also just not allowed :D 
  // const {wallets, ready: walletsReady} = useWallets();
  // const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  if (!publicClient) {
    Error("No publicClient available");
  }

  const loyaltyCardAccount = await toSmartAccount({
    client: client,
    entryPoint: {
      abi: entryPointAbi,
      address: entryPoint.address, // change later to public constant. 
      version: '0.7',
    }, 
    extend: { entryPointAbi, factory },
    
    // Encode calls as defined by the Smart Account contract.
    async encodeCalls(calls): Promise<`0x${string}`> {
      if (calls.length > 1) {
        Error("LoyaltyCard only supports single calls"); // should actually exit function. Implement later. 
      } 
      console.log("calls:", calls)
      try {
        return encodeFunctionData({
          abi: entryPointAbi,
          functionName: 'execute',
          args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? '0x'],
        })

        } catch(error) {
          Error(`Error @encodeCalls: ${error}`)
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
          args: [owner, loyaltyProgram, pad(salt)]
        })
        return cardAddress as `0x${string}`
      } catch(error) {
        Error(`Error @getAddress: ${error}`)
        return '0x'
      }
    },

    // Build the Factory properties for the Smart Account.
    async getFactoryArgs(): Promise<{ factory?: `0x${string}` | undefined; factoryData?: `0x${string}` | undefined}> {
        try { 
          const factoryData = encodeFunctionData({
            abi: factory.abi,
            functionName: 'createAccount',
            args: [owner, pad(salt)],
          })
          return { factory: factory.address as `0x${string}`, factoryData }
        } catch(error) {
          Error(`Error @getFactoryArgs: ${error}`)
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
        Error(`Error @getNonce: ${error}`)
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
        Error(`Error @signMessage: ${error}`)
        return '0x'
      }
    },
        
    // Sign typed data to be verified by the Smart Account contract.
    async signTypedData(typedData): Promise<`0x${string}`> {
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const cardAddress = await this.getAddress()
        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [cardAddress, typedData],
        });
        return signature
      } catch (error) {
        Error(`Error @signTypedData: ${error}`)
        return '0x'
      }
    },
        
    // Sign a User Operation to be broadcasted via the Bundler.
    // NB! in toSoldadySmartAccount example. This is a simple sign message! NOT typedData! 
    async signUserOperation(userOperation): Promise<`0x${string}`> {
      console.log("SIGN USER OPERATION CALLED") 
      let nonce;
      const cardAddress = await this.getAddress()
      const provider = await embeddedWallet.getEthereumProvider();

      try {
        nonce = await publicClient.readContract({
          address: cardAddress as `0x${string}`,
          abi: loyaltyCardAbi,
          functionName: 'getNonce'
        })
      } catch {
        nonce = 0n; // if no address is available, returns nonce = 0n. 
      }

      try {
        // NB! converting the UserOperation object to a PackedUserOperation object. 
        const packedUserOp: PackedUserOperation = { //
          /** Concatenation of {@link UserOperation`verificationGasLimit`} (16 bytes) and {@link UserOperation`callGasLimit`} (16 bytes) */
          accountGasLimits: concat([
            numberToHex(userOperation.verificationGasLimit, {size: 16}), 
            numberToHex(userOperation.callGasLimit, {size: 16}),
            ]), 
          /** The data to pass to the `sender` during the main execution call. */
          callData: userOperation.callData, 
          /** Concatenation of {@link UserOperation`factory`} and {@link UserOperation`factoryData`}. */
          initCode: concat([
            userOperation.factory ? userOperation.factory : '0x11', 
            userOperation.factoryData ? userOperation.factoryData : '0x11'
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

        const userOpHashData = await publicClient.readContract({
          address: entryPoint.address as `0x${string}`,
          abi: entryPoint.abi,
          functionName: 'getUserOpHash',
          args: [packedUserOp]
        })

        console.log("userOpHashData: ", userOpHashData)

        const signature = await provider.request({
          method: 'personal_sign',
          params: [cardAddress, userOpHashData],
        });

        return signature as `0x${string}`
      } catch (error) {
        Error(`Error @signUserOperation: ${error}`)
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

  return loyaltyCardAccount
}



