import { createConfig, http, webSocket } from '@wagmi/core'
import { foundry, sepolia, polygonMumbai, baseSepolia, optimismSepolia } from '@wagmi/core/chains'

// [ = preferred ]
export const wagmiConfig = createConfig({
  chains: [optimismSepolia], //  foundry,  arbitrumSepolia, sepolia,  baseSepolia, [ optimismSepolia ], polygonMumbai
  transports: {
    // [sepolia.id]: http(`process.env.NEXT_PUBLIC_ALCHEMY_SEP_API_RPC`), 
    // [arbitrumSepolia.id]: http(`https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARB_SEP_API_KEY}`), 
    // [arbitrumSepolia.id]: http(), 
    // [baseSepolia.id]: http(), 
    [optimismSepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_OPT_SEPOLIA_HTTPS),
    // [foundry.id]: http("http://localhost:8545"),  // 
    // [polygonMumbai.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_MUMBAI_API_RPC)
  },
  ssr: true,
  // storage: createStorage({
  //   storage: cookieStorage
  // })
})