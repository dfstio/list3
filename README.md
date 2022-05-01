# List
list and zero knowledge proofs of inclusion and exclusion

## Config

git clone https://github.com/Benjamin-Herald/list

Put index.js file with configuration into packages/config directory
and private_deployer.json into packages/contracts directory

Run yarn from list directory

## Contracts

List contract is deployed to mumbai network at address 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb  
Implementation contract is deployed to:  
v1:  0x355bd8a9898751b779bf621650d70eea93fd65ec

https://mumbai.polygonscan.com/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb



Verifier contract is deployed to rinkeby network at address


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
- Allow to call list.add from any address using gasless OpenZeppelin Defender Relayer  
with condition that calling address is equal to address in parameters