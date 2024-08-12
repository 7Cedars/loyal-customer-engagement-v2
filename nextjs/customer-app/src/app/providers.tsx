'use client';

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { ReduxProvider } from "../context/reduxProvider"
import { wagmiConfig } from '../context/wagmiConfig'  
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ['wallet', 'email', 'sms'],
  appearance: {
    showWalletLoginFirst: true,
  },
};

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            config={privyConfig}
            >
            {children}
          </PrivyProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}