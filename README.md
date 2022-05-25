# List
List of claims versions using zero knowledge proofs of inclusion and exclusion

## Installation

You need to install node and git. Then install [circom](https://docs.circom.io/getting-started/installation/):

	curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
	git clone https://github.com/iden3/circom.git
	cargo build --release
	cargo install --path circom
	npm install -g snarkjs

Install [hardhat](https://hardhat.org/getting-started/#installation) that is used for solidity contracts
	
	npm install --save-dev hardhat

and finally clone this repo

	git clone https://github.com/Benjamin-Herald/list3
	cd list3
	yarn

Put config.js file with configuration into packages/config directory using template as example

Make sure that list command is executable by running from list3 folder

	chmod +x ./packages/cli/cli.js
	npm link

Faucets:   
https://goerlifaucet.com/  
https://mumbaifaucet.com/


## Contracts

List contract is deployed to mumbai network at address 0x059c6E0c38bea3C11f55d46a4E4aaC5d8E80cb82  
https://mumbai.polygonscan.com/address/0x059c6E0c38bea3C11f55d46a4E4aaC5d8E80cb82  
Implementation contracts are deployed to:  
v1:  0x1ca9d60c1561fff48f073ff450d25b9545e660d6

ListHash deployed to Goerli: 0x018b46ce6eE624e49d233983E8e3036FB0488b41  
https://goerli.etherscan.io/address/0x018b46ce6eE624e49d233983E8e3036FB0488b41  

VerifierAdd contract is deployed to mumbai network at address 0x613c90582B1668cA6BD31A42803c9e37596a836B  
https://mumbai.polygonscan.com/address/0x613c90582B1668cA6BD31A42803c9e37596a836B  

VerifierPermalink contract is deployed to mumbai network at address 0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515  
https://mumbai.polygonscan.com/address/0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515  

## Usage:
Usage: list [options] [command]

CLI for list and zero knowledge proofs of inclusion and exclusion 

Options:  
  -V, --version                           output the version number  
  -h, --help                              display help for command  

Commands:  
  add [options] <name> <version>          Add to SMT key-value pair: key is permalink of claim, value is version  
  update [options] <permalink> <version>  Update value of SMT key: key is permalink, value is version  
  revoke [options] <permalink>            Revoke SMT key: key is permalink  
  claim <name>                            Generate new claim  
  ethereum                                Verify Version and Roothash Mumbai events on Ethereum Goerli  
  verify                                  Verify proof  
  help [command]                          display help for command  


### add
Usage: list add [options] <name> <version>  

Add to SMT key-value pair: key is permalink of claim, value is version  

Arguments:  
  name             claim name  
  version          claim version, must be 2 or bigger  

Options:  
  -relay <number>  relayId to use  
  -h, --help       display help for command  
  
### claim
Usage: list claim [options] <name>  

Generate new claim  

Arguments:  
  name        claim name  

Options:  
  -h, --help  display help for command
  

## TODO
- update
- revoke
- transfer
- ZK proof of exclusion for Ethereum
- extend scope to roothashes of identity


	