
type ChainSettingProps = {
 // TBI 
}

export const chainSettings = (chainId: number) => {
  switch (chainId) {
    case 31337: {
      return ({ // anvil
          fetchBlockAmount: 10_000, 
          minimumBlocksToFetch: 10, 
          genesisBlock: 0, 
          factoryCardsAddress: '0xc5a5C42992dECbae36851359345FE25997F5C42d' as `0x${string}`, 
          factoryProgramsAddress: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933' as `0x${string}`
        })
    }
    case 11155111: {
      return ({ // eth sepolia
          fetchBlockAmount: 10_000,
          minimumBlocksToFetch: 100, 
          genesisBlock: 0, 
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    case 11155420: {
      return ({ // opt sepolia
          fetchBlockAmount: 50_000,
          minimumBlocksToFetch: 100,
          genesisBlock: 17820505,  
          factoryCardsAddress: '0x6F5202Cc0B36287513f3197FDd515FE7d6befBC4' as `0x${string}`, 
          factoryProgramsAddress: '0x37FD9cA01307708E29812621991eA7DF04e3E539' as `0x${string}`
        })
    }
    case 421614: {
      return ({ // arb sepolia
          fetchBlockAmount: 10_000,
          minimumBlocksToFetch: 100, 
          genesisBlock: 0, 
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    case 84532: {
      return ({ // base sepolia
          fetchBlockAmount: 10_000,
          minimumBlocksToFetch: 100, 
          genesisBlock: 0, 
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    default: {
      console.log("Chain not supported.");
    }
  }
}

