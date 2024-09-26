import { createBundlerClient, createSmartAccountClient, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
// import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { http, createPublicClient, webSocket } from "viem";
import { foundry, optimismSepolia } from "viem/chains";
 
export const publicClient = createPublicClient({
  // transport: http("http://localhost:8545"),
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPT_SEPOLIA_HTTPS), 
});
 
export const bundlerClient = createBundlerClient({
  chain: optimismSepolia,
  // transport: http("http://localhost:4337"), 
  transport: http(process.env.NEXT_PUBLIC_BUNDLER), 
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

// export const paymasterClient = createPimlicoPaymasterClient({
//   chain: foundry,
//   transport: http("http://localhost:3000"), 
//   entryPoint: ENTRYPOINT_ADDRESS_V07,
// });