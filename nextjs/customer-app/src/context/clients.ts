import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, bundlerActions, walletClientToSmartAccountSigner } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { pimlicoBundlerActions } from "permissionless/actions/pimlico";
// import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { http, createPublicClient, createClient } from "viem";
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { foundry, optimismSepolia } from "viem/chains";
import { useWalletClient } from "wagmi";

export const client = createClient({
  chain: optimismSepolia,
  // transport: http("http://localhost:8545"), 
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPT_SEPOLIA_HTTPS)
});

export const publicClient = createPublicClient({
  chain: optimismSepolia,
  // transport: http("http://localhost:8545"), 
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPT_SEPOLIA_HTTPS)
});
 
export const bundlerClient = createBundlerClient({ 
  // client: publicClient, 
  chain: optimismSepolia,
  transport: http(process.env.NEXT_PUBLIC_BUNDLER, 
  // transport: http("http://localhost:4337", 
    { timeout: 30_000 }
  ), // check 
})
  .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
  .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07)) // £bug in docs: https://v1.viem.sh/docs/third-party/account-abstraction.html -- does not have entryPoint added. 




// export const paymasterClient = createPimlicoPaymasterClient({
//   chain: foundry,
//   transport: http("http://localhost:3000"), 
//   entryPoint: ENTRYPOINT_ADDRESS_V07,
// });