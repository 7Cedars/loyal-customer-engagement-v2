'use client';

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import {base, baseGoerli, foundry, mainnet, sepolia, polygon, polygonMumbai} from 'viem/chains';
// import { ReduxProvider } from "./reduxProvider"
import { wagmiConfig } from './wagmiConfig'  
import { WagmiProvider } from 'wagmi'
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const privyConfig: PrivyClientConfig = {
  defaultChain: foundry,
  supportedChains: [foundry, mainnet, sepolia, base, baseGoerli, polygon, polygonMumbai], // add arbitrum, optimism + testnets. 
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: true,
  },
  loginMethods: ['email', 'sms', 'wallet'],
  appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: 'your-logo-url'
  }
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
              {/* <SmartAccountProvider> */}
                 {children}
              {/* </SmartAccountProvider> */}
          </PrivyProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}