#! /usr/bin/env node
const { PROOF_DIR } = require('@list/config');
const { Command } = require('commander');
const program = new Command();
const { add, update, revoke } = require("./list");
const { claim } = require("./claim");
const { checkEthereum } = require("./ethereum");

const util = require('util')
const exec = util.promisify(require('child_process').exec)

program
  .name('list')
  .description('CLI for list and zero knowledge proofs of inclusion and exclusion')
  .version('3.0.0');

program.command('add')
  .description('Add to SMT key-value pair: key is permalink of claim, value is version')
  .argument('<name>', 'claim name')
  .argument('<version>', 'claim version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (name, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('adding {', name, ':' , version, '} pair to SMT relay', relayId);
    await add(name, version, relayId);
  });
  
program.command('update')
  .description('Update value of SMT key: key is permalink of claim, value is version')
  .argument('<name>', 'claim name')
  .argument('<version>', 'claim version, must be 3 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (name, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('updating', name, 'to version' , version, 'on SMT relay', relayId);
    await update(name, version, relayId);
  });  

program.command('revoke')
  .description('Revoke SMT key: key is permalink of claim')
  .argument('<name>', 'claim name')
  .option('-relay <number>', 'relayId to use')
  .action(async (name, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('revoking claim', name, 'on SMT relay', relayId);
    await revoke(name, relayId);
  });  

program.command('claim')
  .description('Generate new claim')
  .argument('<name>', 'claim name')
  .action(async (name) => {
    console.log('Creating claim', name);
	await claim(name);
  });  
  
  
program.command('ethereum')
  .description('Verify Version and Roothash Mumbai events on Ethereum Goerli')
  .action(async () => {
    console.log('Verifying Version and Roothash Mumbai events on Ethereum Goerli...');
	await checkEthereum();
  }); 
  
program.command('verify')
  .description('Verify proof')
  .action(async () => {
    console.log('Verifying proof...');
    let out = 'snarkjs cli call failed';
	try {
      	out = await exec(`snarkjs g16v ${PROOF_DIR}verification_key.json ${PROOF_DIR}public.json ${PROOF_DIR}proof.json`);
      	console.log("Result of snarkjs verify cli call: ", out.stdout.toString());
    } catch (e) {
      console.log(out, e)
      throw e
    }
  }); 
  

async function main()
{
	await program.parseAsync();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });