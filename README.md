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

## SNARKS
server: https://protected-temple-09609.herokuapp.com/


## Contracts

List contract is deployed to mumbai network at address 0x91478CfAFbD29F4c89CD2e4e89506AFFb89651df  
https://mumbai.polygonscan.com/address/0x91478CfAFbD29F4c89CD2e4e89506AFFb89651df  
Implementation contracts are deployed to:  
v1:  0x6e706fac3d10c6bd7dbe86eaf5d6e65ed31d3224
v2:  0xecc438f80adc0bfeeea580f8dcbda00247884c08 - added seal function and Seal event
v3:  0x04746cf4b7857db865fe84678944e87dd6f9b6eb - added blockHash function

ListHash deployed to Goerli: 0xB24f820BaA49697D5af186955b4b4671E68Ce8F1  
https://goerli.etherscan.io/address/0xB24f820BaA49697D5af186955b4b4671E68Ce8F1  

Verifier deployed to Goerli: 0xd58bf69DaBcAEfe8D1EAd6327190ff215F5b0c3f  
https://goerli.etherscan.io/address/0xd58bf69DaBcAEfe8D1EAd6327190ff215F5b0c3f 

Score example contract deployed to Goerli: 0x6145E4c12CEd552C28FEC4753b64C26c53028010  
https://goerli.etherscan.io/address/0x6145E4c12CEd552C28FEC4753b64C26c53028010 
https://mumbai.polygonscan.com/address/0x8dD9A8C0a838E0BE1A64FE51348EE1b18AF6bf51#code

ScoreAWS example contract deployed to AWS: 0x8750A33948C11E21484fb21e9Ff2D0e238e8527f

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

Bridge contracts are deployed to:
mumbai 0xF4084E4dfC2B85885d9CFd58134eE0939A4Af89D https://mumbai.polygonscan.com/address/0xF4084E4dfC2B85885d9CFd58134eE0939A4Af89D#code
goerli 0xdf9D69197Ff058D24f0E170a49E0D03ebC723d2e https://goerli.etherscan.io/address/0xdf9D69197Ff058D24f0E170a49E0D03ebC723d2e#code

Prover contract is deployed to:
goerli 0xecc438f80adc0bfEeEA580f8DCbda00247884C08 https://goerli.etherscan.io/address/0xecc438f80adc0bfEeEA580f8DCbda00247884C08#code

## Usage:
```
Usage (from list3 folder): list [options] [command]

CLI for list and zero knowledge proofs of inclusion and exclusion 

Options:  
  -V, --version                           output the version number  
  -h, --help                              display help for command  
 
Commands:
  add [options] <name> <version>         Add to SMT key-value pair: key is permalink of claim, value is version
  update [options] <name> <version>      Update value of SMT key: key is permalink of claim, value is version
  revoke [options] <name>                Revoke SMT key: key is permalink of claim
  claim <name>                           Generate new claim
  ethereum                               Verify Version and Roothash Mumbai events on Ethereum Goerli
  verify [options] <permalink>           Verify ZK proof of inclusion or exclusion on Goerli
  score [options] <permalink> <version>  Example: Add score with transaction on Goerli with ZK proof of inclusion or exclusion
  seal [options] <permalink>             Example 2: Add score with transaction on Goerli with fresh seal on Mumbai
  snarkverify                            Verify proof in ./proof folder by executing snarkjs
  help [command]                         display help for command
```

### add
Claim version is added to blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly inserted into tree  

```
Usage: list add [options] <name> <version>  

Add to SMT key-value pair: key is permalink of claim, value is version  

Arguments:  
  name             claim name  
  version          claim version, must be 2 or bigger  

Options:  
  -relay <number>  relayId to use  
  -h, --help       display help for command  
```	  
### update
Claim version is updated to blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly updated on tree  

```
Usage: list update [options] <name> <version>

Update value of SMT key: key is permalink of claim, value is version

Arguments:
  name             claim name
  version          claim version, must be 3 or bigger

Options:
  -relay <number>  relayId to use
  -h, --help       display help for command
```
### revoke	  
Claim version is revoked on blockchain checking 2 ZK proofs:
1) That permalink is owned by claim (executing ZK circuit calculating peterson hash)
2) That new leaf is correctly updated on tree (if existed before) or inserted to tree  
```
Usage: list revoke [options] <name>

Revoke SMT key: key is permalink of claim

Arguments:
  name             claim name

Options:
  -relay <number>  relayId to use
  -h, --help       display help for command
```  
### claim
New claim is being created in ./data folder. 
Private key is being generated and permalink of a claim is 
peterson hash of private key.   
```
Usage: list claim [options] <name>  

Generate new claim  

Arguments:  
  name        claim name  

Options:  
  -h, --help  display help for command
```  

### score
Test transaction on Goerli   
```
Usage: list score [options] <permalink> <version>

Example: Add score with transaction on Goerli with ZK proof of inclusion or exclusion

Arguments:
  permalink        claim permalink
  version          claim version

Options:
  -relay <number>  relayId to use
  -h, --help       display help for command
```  

### seal
Test transaction on Goerli   
```
Usage: list seal [options] <permalink>

Example 2: Add score with transaction on Goerli with fresh seal on Mumbai

Arguments:
  permalink           claim permalink

Options:
  -validity <number>  validity of seal in hours, default is 1 hour
  -h, --help          display help for command
```  

### verify
Verify ZK proof of inclusion or exclusion on Goerli   
```
Usage: list verify [options] <permalink>

Verify ZK proof of inclusion or exclusion on Goerli

Arguments:
  permalink        claim permalink

Options:
  -relay <number>  relayId to use
  -h, --help       display help for command
```  

## TODO
- transfer
- Transaction on mumbai proving exclusion
- extend scope to roothashes of identity


	