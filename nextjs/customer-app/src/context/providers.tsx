'use client';

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import {base, baseGoerli, foundry, mainnet, sepolia, polygon, polygonMumbai, optimismSepolia, arbitrumSepolia} from 'viem/chains';
// import { ReduxProvider } from "./reduxProvider"
import { wagmiConfig } from './wagmiConfig'  
import {WagmiProvider} from '@privy-io/wagmi';
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const privyConfig: PrivyClientConfig = {
  defaultChain: optimismSepolia,
  supportedChains: [optimismSepolia, foundry, mainnet, sepolia, base, baseGoerli, polygon, polygonMumbai, arbitrumSepolia], 
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    noPromptOnSignature: true,
  },
  loginMethods: ['email', 'sms'],
  appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: 'your-logo-url'
  }
};

export default function Providers({children}: {children: React.ReactNode}) {
  return (  
    <Provider store={store}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
        config={privyConfig}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>

            {/* <SmartAccountProvider> */}
              {children}
            {/* </SmartAccountProvider> */}
            </WagmiProvider>
          </QueryClientProvider>
      </PrivyProvider>
    </Provider>
    
  );
}