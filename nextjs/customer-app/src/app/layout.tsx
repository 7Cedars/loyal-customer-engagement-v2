import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers" 

export const metadata: Metadata = {
  title: 'Customer Loyalty Program - customer',
  description: 'Customer Loyalty Program build with NextJS and Wagmi, with backend in solidity.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
