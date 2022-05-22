# List
list and zero knowledge proofs of inclusion and exclusion

## Configuration

git clone https://github.com/Benjamin-Herald/list

Put listconfig.js file with configuration into packages/config directory using template as example


Run yarn from list directory

In case you plan to change circuit, install circom using 
https://docs.circom.io/getting-started/installation/

Faucet: https://goerlifaucet.com/

## Contracts

List contract v 1 is deployed to mumbai network at address 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb  
Implementation contracts are deployed to:  
v1:  0x355bd8a9898751b779bf621650d70eea93fd65ec
v2:  0xbDEBAb0a14CDa02c196bDC2C2490D96d3DfC6a61

https://mumbai.polygonscan.com/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb

List contract v 2 is deployed to mumbai network at address 0x572aC98bDea8950f348d2C66945d4E5312B35bbe  
Implementation contracts are deployed to:  
v1:  0xd58bf69dabcaefe8d1ead6327190ff215f5b0c3f


https://mumbai.polygonscan.com/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb


ListHash deployed to Goerli: 0x355Bd8a9898751b779Bf621650d70eEa93FD65eC
https://goerli.etherscan.io/address/0x355bd8a9898751b779bf621650d70eea93fd65ec#code

Verifier contract is deployed to rinkeby network at address 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb
https://rinkeby.etherscan.io/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb

### Usage:

	List contract: add( address, version, hash )
	New record is being added for address changing to new version with additional information 
	written to string hash (that can be IPFS hash or proof)

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