"use client"

import { store } from "../redux/store";
import { Provider } from "react-redux";
import React from "react"

// see https://cloud.reown.com/app/1a6f09b7-686f-4b39-9428-f260e3557948/project/8273a91f-2417-418e-b761-8a0b7acdfd08
import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { optimismSepolia, arbitrumSepolia, AppKitNetwork } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '6056a457c9f333cabea03b31fe8917a2'

// 2. Create a metadata object - optional
const metadata = {
  name: 'loyalty-program',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 3. Set the networks
const networks : AppKitNetwork[] = [optimismSepolia, arbitrumSepolia]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as [AppKitNetwork, ...AppKitNetwork[]], 
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  return ( 
    <Provider store={store}>
       <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
    </Provider>
    ); 
}