import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Web3ModalProvider from '../context'
import { ReduxProvider } from "../context/reduxProvider" 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Customer Loyalty Program - vendor',
  description: 'Customer Loyalty Program build with NextJS and wagmi, with backend in solidity.',
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en">
      <body>
      <ReduxProvider>
        <Web3ModalProvider > {/* initialState={initialState} */}
            {children}
          </Web3ModalProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}