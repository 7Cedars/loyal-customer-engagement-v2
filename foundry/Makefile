# £ack this file was originally copied from https://github.com/Cyfrin/foundry-erc20-f23/blob/main/Makefile
-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules 
#&& git add . 
#&& git commit -m "modules"

# Install modules
install :; forge install foundry-rs/forge-std@v1.9.1 --no-commit && forge install openzeppelin/openzeppelin-contracts@v5.0.2 --no-commit && forge install eth-infinitism/account-abstraction@v0.7.0 --no-commit && forge install bokkypoobah/BokkyPooBahsDateTimeLibrary --no-commit

# Update Dependencies
update:; forge update

# Build
build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil --steps-tracing --block-time 1

#####################################################
# 						Anvil: Deploy Contracts								# 
#####################################################
ANVIL_ARGS_0 := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY_0) --broadcast

anvilDeployFactory: 
	@forge script script/DeployFactoryPrograms.s.sol:DeployFactoryPrograms $(ANVIL_ARGS_0)
	
anvilDeploySampleGifts: 
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFreeCoffee $(ANVIL_ARGS_0)
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFreeCupCake $(ANVIL_ARGS_0)
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFridayFifteen $(ANVIL_ARGS_0)

anvilAll:
	@forge script script/DeployFactoryPrograms.s.sol:DeployFactoryPrograms $(ANVIL_ARGS_0)
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFreeCoffee $(ANVIL_ARGS_0)
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFreeCupCake $(ANVIL_ARGS_0)
	@forge script script/DeployLoyaltyGifts.s.sol:DeployFridayFifteen $(ANVIL_ARGS_0)