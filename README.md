# List
list and zero knowledge proofs of inclusion and exclusion

## Contracts

List contract is deployed to mumbai network:

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

