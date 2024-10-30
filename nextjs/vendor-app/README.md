<p align="center">

<br />
<div align="center">
  <a href="https://github.com/7Cedars/loyal-customer-engagement-v2"> 
    <img src="./public/logo.png" alt="Logo" width="200" height="200">
  </a>

<h2 align="center">Customer Loyalty Program: Vendor App</h2>
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
./nextjs/vendor-app
├── .well-known             # ReOwn appKit id
├── public                  # Public assets
├── src                     # Source code
│   ├── app                 # Reusable components
|   │   ├── about           # About page
|   |   │   └── ...         
|   │   ├── gifts           # select gifts page
|   |   │   └── ...         
|   │   ├── home            # Home page
|   |   │   └── ...         
|   │   ├── transactions    # Transaction overview page
|   |   │   └── ...         
|   │   ├── settings        # Settings page
|   |   │   └── ...         
|   │   ├── globals.css     # Styling files
|   │   ├── layout.tsx      # Layout
|   │   ├── Loader.tsx      # Loader components
|   │   └── page.tsx        # landing page
│   ├── components          # Reusable components
|   │   ├── application     # Components for app functionality   
|   |   │    └── ...         
|   │   └── ui              # Basic UI components 
|   |        └── ...         
│   ├── context             # Abi, chains, clients, providers. 
|   │   └── ...             
│   ├── hooks               # Custom hooks
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see dashboard. 

4. To set up a deployment that interacts with a locally deployed chain using foundry 

    - Install following the directions at [[docs.pimlico](https://docs.pimlico.io/permissionless/how-to/local-testing)](https://docs.pimlico.io/permissionless/how-to/local-testing).
    - You'll know that everything works if you can run `docker compose up` and can access 
      - Anvil at localhost:8545
      - Alto Bundler at localhost:4337
      - Mock Paymaster at localhost:3000 

## Live version 

A live version can be seen on [vercel](https://clpv.vercel.app/).  

