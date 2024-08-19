import { createBundlerClient, createSmartAccountClient, ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
// import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { http, createPublicClient, createClient } from "viem";
import { foundry } from "viem/chains";
 
export const publicClient = createPublicClient({
  transport: http("http://localhost:8545"), 
});
 
export const bundlerClient = createClient({ 
  chain: foundry,
  transport: http("http://localhost:4337") // check 
}).extend(bundlerActions(ENTRYPOINT_ADDRESS_V07)) // £bug in docs: https://v1.viem.sh/docs/third-party/account-abstraction.html -- does not have entryPoint added. 

// export const paymasterClient = createPimlicoPaymasterClient({
//   chain: foundry,
//   transport: http("http://localhost:3000"), 
//   entryPoint: ENTRYPOINT_ADDRESS_V07,
// });