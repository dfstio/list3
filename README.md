# List
list and zero knowledge proofs of inclusion and exclusion

## Configuration

git clone https://github.com/Benjamin-Herald/list

Put listconfig.js file with configuration into packages/config directory using template as example


Run yarn from list directory

In case you plan to change circuit, install circom using 
https://docs.circom.io/getting-started/installation/

## Contracts

List contract is deployed to mumbai network at address 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb  
Implementation contracts are deployed to:  
v1:  0x355bd8a9898751b779bf621650d70eea93fd65ec
v2:  0xbDEBAb0a14CDa02c196bDC2C2490D96d3DfC6a61

https://mumbai.polygonscan.com/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb



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
- Write template config
- AWS lambda
- IPFS
- Sync
- Scripts on monorepo level
- Goals