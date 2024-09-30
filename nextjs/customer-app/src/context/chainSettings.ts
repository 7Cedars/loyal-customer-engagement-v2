
type ChainSettingProps = {
 // TBI 
}

export const chainSettings = (chainId: number) => {
  switch (chainId) {
    case 31337: {
      return ({ // anvil
          factoryCardsAddress: '0xc5a5C42992dECbae36851359345FE25997F5C42d' as `0x${string}`, 
          factoryProgramsAddress: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933' as `0x${string}`
        })
    }
    case 11155111: {
      return ({ // eth sepolia
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    case 11155420: {
      return ({ // opt sepolia
        factoryCardsAddress: '0xBCAEa2Ae164bAd93d7C4736099F8eed6A50d3cd5' as `0x${string}`, 
        factoryProgramsAddress: '0x3f4f6216B1f2beBF15DD11dFb7c87EE540BA371b' as `0x${string}`
      })
    }
    case 421614: {
      return ({ // arb sepolia
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    case 84532: {
      return ({ // base sepolia
          factoryCardsAddress: '0x0' as `0x${string}`, 
          factoryProgramsAddress: '0x0' as `0x${string}`
        })
    }
    default: {
      console.log("Chain not supported.");
    }
  }
}

