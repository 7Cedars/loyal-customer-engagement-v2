import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Web3ModalProvider from '../context'
import { Providers } from "../context/Providers" 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vendor Loyalty app',
  description: 'A modular and open-source dApp for customer engagement programs - vendor app.',
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
      <Providers>
            {children}
      </Providers>
      </body>
    </html>
  )
}