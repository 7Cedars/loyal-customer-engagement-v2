<p align="center">

<br />
<div align="center">
  <a href="https://github.com/7Cedars/loyal-customer-engagement-v2"> 
    <img src="./public/logo.png" alt="Logo" width="200" height="200">
  </a>

<h2 align="center">Customer Loyalty Program: Customer App</h2>
  <p align="center">
    A composable solidity protocol and lightweight dApp for real-world customer engagement
    <br />
    <br />
    <!--NB: TO DO --> 
    <a href="../README.md">Conceptual overview</a>
    ·
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#live-version">Live version</a>
  </p>
  <br />
  <br />
</div>

## What's included

[Next.js](https://nextjs.org/) - Framework<br>
[ReOwn](https://reown.com/) - Wallet Framework<br>
[TailwindCSS](https://tailwindcss.com/) - Styling<br>
[TypeScript](https://www.typescriptlang.org/) - Type safety<br>
[Redux](redux.js.org) - state management<br>

## Directory Structure
```
./nextjs/customer-app
├── .well-known             # ReOwn appKit id
├── public                  # Public assets
├── src                     # Source code
│   ├── app                 # Reusable components
|   │   ├── about           # About page
|   |   │   └── ...         
|   │   ├── exchangePoints  # Exchange points page
|   |   │   └── ...         
|   │   ├── home            # Home page
|   |   │   └── ...         
|   │   ├── redeemGifts     # Redeem Gifts page
|   |   │   └── ...         
|   │   ├── settings        # Settings page
|   |   │   └── ...         
|   │   ├── globals.css     # Styling files
|   │   ├── layout.tsx      # Layout
|   │   ├── Loader.tsx      # Loader components
|   │   └── page.tsx        # landing page
│   ├── components          # Reusable components
|   │   └── ...             
│   ├── context             # Abi, chains, clients, providers. 
|   │   └── ...             
│   ├── hooks               # Custom hooks
|   │   ├── useLoyaltyCards # Hook interacting with bespoke ERC-4337 implementation 
|   │   └── ...             
│   ├── redux               # Redux store 
|   │   └── ...             
│   ├── types               # Type safety 
|   │   └── index.d.ts      
│   └── utils               # Utility functions
|       └── parsers.ts      # parsers
├── .env.example            # Example environment variables
├── LICENSE                 # License information
├── README.md               # Project documentation
└── ...                     
```

## Getting Started

1. Install the dependencies 
```bash
yarn install 
```

2. Copy `.env.example` to `.env` and update the variables.

```sh
# Copy .env.example to .env. Acquire and fill out missing keys. 
cp apps/api/.env.example apps/api/.env
```

3. run the development server:

```bash
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see dashboard. 

## Live version 

A live version can be seen on [vercel](https://clpc.vercel.app/).  

