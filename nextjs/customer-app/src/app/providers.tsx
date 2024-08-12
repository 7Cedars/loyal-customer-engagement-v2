'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReduxProvider } from "../context/reduxProvider"
import { wagmiConfig } from '../context/wagmiConfig'  
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider>
          <PrivyProvider
            appId="clzqwafdw00br10r7473td2ir"
            config={{
              // Customize Privy's appearance in your app
              appearance: {
                theme: 'light',
                accentColor: '#676FFF',
                logo: 'https://your-logo-url',
              },
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                createOnLogin: 'users-without-wallets',
              },
            }}
          >
            {children}
          </PrivyProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}