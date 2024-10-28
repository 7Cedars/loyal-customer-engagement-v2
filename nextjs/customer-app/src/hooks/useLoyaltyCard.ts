"use client"
import { entryPointAbi, factoryCardsAbi, loyaltyCardAbi, loyaltyProgramAbi } from "@/context/abi"
import { bundlerClient, publicClient, client } from "@/context/clients"
import { useAppSelector } from "@/redux/hooks"
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth"
import { ENTRYPOINT_ADDRESS_V07, parseAccount, UserOperation,  } from "permissionless"
import { useCallback, useEffect, useState } from "react"
import { encodeFunctionData, numberToHex, pad } from "viem"
import { getUserOperationHash } from "viem/account-abstraction"
import { toSmartAccount } from 'viem/account-abstraction'
import { chainSettings } from "../context/chainSettings"
import { useChainId } from "wagmi"
import { LoyaltyCard } from "@/types"

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
  const [loading, setLoading] = useState<boolean>(false); 
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard>(); 
  const [userOp, setUserOp] = useState<UserOperation<"v0.7">>(); 

  const {selectedProgram: prog} = useAppSelector(state => state.selectedProgram)
  const {signMessage} = usePrivy();
  const {wallets, ready: walletsReady} = useWallets();
  const chainId = useChainId() 
  const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));

  const deployed = chainSettings(chainId) 

  const fetchLoyaltyCard = useCallback(
    async (
      loyaltyProgram: `0x${string}`, 
      salt: bigint,
      embeddedWallet: ConnectedWallet, 
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
        address: deployed?.factoryCardsAddress,
      } as const

      const owner = parseAccount(embeddedWallet.address as `0x${string}`)

      setLoading(true);
      setError(null);

      const account = await toSmartAccount({
        // address: cardAddress, 
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
          try { 
            const cardAddress = await publicClient.readContract({
              address: deployed?.factoryCardsAddress as `0x${string}`,
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
            try { 
              const factoryData = encodeFunctionData({
                abi: factoryCardsAbi,
                functionName: 'createAccount',
                args: [embeddedWallet.address, loyaltyProgram, salt],
              })
              return {factory: deployed?.factoryCardsAddress as `0x${string}`, factoryData}
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
            chainId: chainId, // chainId,
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
              title: 'Sign transaction',
              description: 'Please validate your transaction',
              buttonText: 'Sign',
            };
            const signature = await signMessage(userOpHash, uiConfig);

            return signature as `0x${string}`
          } catch (error) {
            setError(`Error @signUserOperation: ${error}`)
            return '0x11'
          }
        },
      })

      setLoading(false)
      setLoyaltyCard(account)

    }, [])

    const createUserOp = useCallback(
      async (loyaltyProgram:  `0x${string}`, loyaltyCard: LoyaltyCard, functionName: string, args: any[], salt: bigint) => {
        const callGasLimit: bigint = 1659000n
        // £todo. NB! Re gas costs: see https://docs.optimism.io/builders/app-developers/transactions/parameters 
        // ALSO! this needs to be set in chain config! -- calculation differs per chain.. 
        // Because gas fees constantly change..
        const preVerificationGas: bigint = 2619697600n
        const verificationGasLimit: bigint = 7261140n
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

        setLoading(true);
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
          address:  deployed?.factoryCardsAddress,
        } as const
        const key = 0n; 
        const factoryData = encodeFunctionData({
          abi: factory.abi,
          functionName: 'createAccount',
          args: [owner.address, loyaltyProgram, salt],
        })

        let nonce; 
        let cardAddress;
        let isDeployed; 
        
        try {
          isDeployed = await loyaltyCard.isDeployed() 
          
          cardAddress = await publicClient.readContract({
            address: deployed?.factoryCardsAddress as `0x${string}`,
            abi: factoryCardsAbi,
            functionName: 'getAddress',
            args: [embeddedWallet.address, loyaltyProgram, salt]
          })

          console.log("address @createUserOp", cardAddress)
          console.log("entrypoint @createUserOp", entryPoint.address)
          
          try {
            nonce = await publicClient.readContract({
              address: entryPoint.address,
              abi: entryPointAbi,
              functionName: 'getNonce', 
              args: [cardAddress, key],
            })
            console.log("getNonce result @customer:", nonce)
          } catch {
            nonce = 0n
          } 

          console.log("nonce @createUserOp", nonce)

          const functionData = encodeFunctionData({
            abi: loyaltyProgramAbi,
            functionName: functionName, 
            args: args
          })

          console.log("functionData @createUserOp", functionData)

          //dest, value, functionData)

          const callData = encodeFunctionData({
            abi: loyaltyCardAbi,
            functionName: 'execute', 
            args: [prog.address, 0n, functionData]
          })

          console.log("callData @createUserOp", callData)

          const userOperation: UserOperation<"v0.7"> = {
            /** The data to pass to the `sender` during the main execution call. */
            callData: callData,
            /** The amount of gas to allocate the main execution call */
            callGasLimit: callGasLimit, 
            /** Account factory. Only for new accounts. */
            factory: nonce == 0n ? factory.address as `0x${string}` : undefined,
            /** Data for account factory. */
            factoryData: nonce == 0n ? factoryData : undefined, 
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
      async (loyaltyProgram: `0x${string}`, loyaltyCard: LoyaltyCard, functionName: string, args: any[], salt: bigint) => {
        console.log("sendUserOp called")

        const userOperation = await createUserOp(loyaltyProgram, loyaltyCard, functionName, args, salt);
        if (userOperation) {
          const signature = await loyaltyCard.signUserOperation(userOperation);
          const userOpSigned = {...userOperation, signature: signature} 
          const hash = await bundlerClient.sendUserOperation({userOperation: userOpSigned}) 
          console.log("HASH: ", hash)     
        } else {
          Error("sendUserOp: userOperation did not come through")
        }
      }, [])

  useEffect(() => {
    if (prog && prog.address && embeddedWallet) {
      fetchLoyaltyCard(
        prog.address, 
        123456n, 
        embeddedWallet
      )
    }
  }, [prog, embeddedWallet, fetchLoyaltyCard])

    return { fetchLoyaltyCard, loyaltyCard, loading, error, createUserOp, userOp, sendUserOp};
  
  }

