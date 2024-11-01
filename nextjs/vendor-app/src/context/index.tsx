'use client'

import React, { ReactNode } from 'react'
import { wagmiConfig, projectId } from '../../wagmi-config'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

// Create modal
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  // chainImages: {
  //   421614: 'https://github.com/7Cedars/loyalty-program-next/blob/main/public/images/arbitrumLogo.png' // public/images/arbitrum.svg' -- does nto work yet. 
  // },
  allWallets: 'ONLY_MOBILE'
})

// £todo: clean up providers. See the customer side for an approach to do so.  
export default function Web3ModalProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
      {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}