'use client';

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
// import { ReduxProvider } from "./reduxProvider"
import { wagmiConfig } from './wagmiConfig'  
import { WagmiProvider } from 'wagmi'
import { store } from "../redux/store";
import { Provider } from "react-redux";
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
        <Provider store={store}>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            config={privyConfig}
            >
            {children}
          </PrivyProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}