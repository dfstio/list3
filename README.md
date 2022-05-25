# List
list and zero knowledge proofs of inclusion and exclusion

## Configuration

git clone https://github.com/Benjamin-Herald/list

Put listconfig.js file with configuration into packages/config directory using template as example


Run yarn from list directory

In case you plan to change circuit, install circom using 
https://docs.circom.io/getting-started/installation/

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

Verifier contract is deployed to rinkeby network at address 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb
https://rinkeby.etherscan.io/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb

VerifierAdd contract is deployed to mumbai network at address 0x613c90582B1668cA6BD31A42803c9e37596a836B
https://mumbai.polygonscan.com/address/0x613c90582B1668cA6BD31A42803c9e37596a836B

VerifierPermalink contract is deployed to mumbai network at address 0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515
https://mumbai.polygonscan.com/address/0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515
### Usage:

	List contract: add( address, version, hash )
	New record is being added for address changing to new version with additional information 
	written to string hash (that can be IPFS hash or proof)

When sharing the object, identity should share object permalink, relayId responsible for sealing on blockchain with List contract and object version

## Command line tools

Sync list contract to proof contract:  
yarn Sync

Generate proof from list contract:  
yarn proof <address> myproof.json

Check proof on proof contract:  
yarn verify myproof.json

Add address to list contract:  
yarn add <address> <IPFShash>

## TODO

- Add SMT roothash calculation in the contract
- Add ZK proof verification on add and revoke functions


- Write template config
- AWS lambda
- IPFS
- Sync
- Scripts on monorepo level
- Goals
- Previous root in Verifier 

## FAQ
If list command is not working, run in the packages/cli folder:
	
	chmod +x cli.js
	
and in the list folder

	npm link
	
Then try to run list command from the list folder

	list help
	
	