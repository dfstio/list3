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

List contract is deployed to mumbai network at address 0x91478CfAFbD29F4c89CD2e4e89506AFFb89651df  
https://mumbai.polygonscan.com/address/0x91478CfAFbD29F4c89CD2e4e89506AFFb89651df  
Implementation contracts are deployed to:  
v1:  0x6e706fac3d10c6bd7dbe86eaf5d6e65ed31d3224

ListHash deployed to Goerli: 0x68DB2cf0E076E3DDBdb66179760Da4a9BB232d33  
https://goerli.etherscan.io/address/0x68DB2cf0E076E3DDBdb66179760Da4a9BB232d33  

VerifierAdd contract is deployed to mumbai network at address 0x613c90582B1668cA6BD31A42803c9e37596a836B  
https://mumbai.polygonscan.com/address/0x613c90582B1668cA6BD31A42803c9e37596a836B  

VerifierUpdate contract is deployed to mumbai network at address 0xcE46ffc2f53B9343114b0fD2583ab3C10ce46BE2  
https://mumbai.polygonscan.com/address/0xcE46ffc2f53B9343114b0fD2583ab3C10ce46BE2  

VerifierRevoke contract is deployed to mumbai network at address 0x62Bfb94b472044F09125a7662C81FEf36D22D305 
https://mumbai.polygonscan.com/address/0x62Bfb94b472044F09125a7662C81FEf36D22D305

VerifierAddRevoked contract is deployed to mumbai network at address 0x25c593AAeaA06a41881186a8cE174C9AB0ec537e 
https://mumbai.polygonscan.com/address/0x25c593AAeaA06a41881186a8cE174C9AB0ec537e

VerifierPermalink contract is deployed to mumbai network at address 0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515  
https://mumbai.polygonscan.com/address/0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515  

## Usage:
	Usage (from list3 folder): list [options] [command]

	CLI for list and zero knowledge proofs of inclusion and exclusion 

	Options:  
	  -V, --version                           output the version number  
	  -h, --help                              display help for command  

	Commands:  
	  add [options] <name> <version>     Add to SMT key-value pair: key is permalink of claim, value is version
	  update [options] <name> <version>  Update value of SMT key: key is permalink of claim, value is version
	  revoke [options] <name>            Revoke SMT key: key is permalink of claim
	  claim <name>                       Generate new claim
	  ethereum                           Verify Version and Roothash Mumbai events on Ethereum Goerli
	  verify                             Verify proof
	  help [command]                     display help for command 


### add
Claim version is added to blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly inserted into tree
	Usage: list add [options] <name> <version>  

	Add to SMT key-value pair: key is permalink of claim, value is version  

	Arguments:  
	  name             claim name  
	  version          claim version, must be 2 or bigger  

	Options:  
	  -relay <number>  relayId to use  
	  -h, --help       display help for command  
	  
### update
Claim version is updated to blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly updated on tree
	Usage: list update [options] <name> <version>

	Update value of SMT key: key is permalink of claim, value is version

	Arguments:
	  name             claim name
	  version          claim version, must be 3 or bigger

	Options:
	  -relay <number>  relayId to use
	  -h, --help       display help for command

### revoke	  
Claim version is revoked on blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly updated on tree (if existed before) or inserted to tree

		Usage: list revoke [options] <name>

		Revoke SMT key: key is permalink of claim

		Arguments:
		  name             claim name

		Options:
		  -relay <number>  relayId to use
		  -h, --help       display help for command
  
### claim
New claim is being created in ./data folder. 
Private key is being generated and permalink of a claim is 
peterson hash of private key

	  Usage: list claim [options] <name>  

	  Generate new claim  

	  Arguments:  
		name        claim name  

	  Options:  
		-h, --help  display help for command
  

## TODO
- transfer
- ZK proof of exclusion for Ethereum
- extend scope to roothashes of identity


	