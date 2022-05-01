# List
list and zero knowledge proofs of inclusion and exclusion

## Config

Put index.js file with configuration into packages/config directory
and private_deployer.json into packages/contracts directory

## Contracts

List contract is deployed to mumbai network: 0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb
Implementation contract: 0x355bd8a9898751b779bf621650d70eea93fd65ec

https://mumbai.polygonscan.com/address/0xD7737dDf725f5006cCc682b337b4cc4dfd5c04fb



Proof contract is deployed to rinkeby network:

## Command line tools

Sync list contract to proof contract:  
yarn Sync

Generate proof from list contract:  
yarn proof <address> myproof.json

Check proof on proof contract:  
yarn verify myproof.json

Add address to list contract:  
yarn add <address> <IPFShash>

