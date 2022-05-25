#! /usr/bin/env node
const { PROOF_DIR } = require('@list/config');
const { Command } = require('commander');
const program = new Command();
const { add, update, revoke } = require("./list");
const { claim } = require("./claim");
const util = require('util')
const exec = util.promisify(require('child_process').exec)

program
  .name('list')
  .description('CLI for list and zero knowledge proofs of inclusion and exclusion')
  .version('3.0.0');

program.command('add')
  .description('Add to SMT key-value pair: key is permalink, value is version')
  .argument('<name>', 'claim name')
  .argument('<version>', 'claim version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (name, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('adding {', name, ':' , version, '} pair to SMT relay', relayId);
    await add(name, version, relayId);
  });
  
program.command('update')
  .description('Update value of SMT key: key is permalink, value is version')
  .argument('<permalink>', 'object permalink')
  .argument('<version>', 'object version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('updating key', permalink, 'to version' , version, 'on SMT relay', relayId);
    console.log("Not implemented yet");
  });  

program.command('revoke')
  .description('Revoke SMT key: key is permalink')
  .argument('<permalink>', 'object permalink')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('revoking key', permalink, 'on SMT relay', relayId);
    console.log("Not implemented yet");
  });  

program.command('claim')
  .description('Generate new claim')
  .argument('<name>', 'claim name')
  .action(async (name) => {
    console.log('Creating claim', name);
	await claim(name);
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