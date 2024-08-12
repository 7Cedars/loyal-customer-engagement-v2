import { http, webSocket } from '@wagmi/core'
import  {createConfig} from '@privy-io/wagmi';
import { foundry, sepolia, polygonMumbai, baseSepolia, optimismSepolia } from '@wagmi/core/chains'
import { walletConnect, injected } from '@wagmi/connectors'

const metadata = {
  name: 'loyalty-program',
  description: 'Customer Loyalty Program - customer',
  url: 'https://loyalty-program-psi.vercel.app/', 
  icons: ['public/images/iconLoyaltyProgram.svg']
}

// [ = preferred ]
export const wagmiConfig = createConfig({
  chains: [foundry, optimismSepolia], //  foundry,  arbitrumSepolia, sepolia,  baseSepolia, [ optimismSepolia ], polygonMumbai
  transports: {
    [foundry.id]: http(), 
    // [sepolia.id]: http(`process.env.NEXT_PUBLIC_ALCHEMY_SEP_API_RPC`), 
    // [arbitrumSepolia.id]: http(`https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARB_SEP_API_KEY}`), 
    // [arbitrumSepolia.id]: http(), 
    // [baseSepolia.id]: http(), 
    [optimismSepolia.id]: webSocket(process.env.NEXT_PUBLIC_ALCHEMY_OPT_SEPOLIA_WSS)  // 
    // [polygonMumbai.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_MUMBAI_API_RPC)
  },
  ssr: true,
  // storage: createStorage({
  //   storage: cookieStorage
  // })
})