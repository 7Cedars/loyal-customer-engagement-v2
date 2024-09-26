import type { Metadata } from "next";
import "./globals.css";
import Providers from "../context/providers" 

export const metadata: Metadata = {
  title: 'Customer Loyalty app',
  description: 'A modular and open-source dApp for customer engagement programs - customer app.',
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
