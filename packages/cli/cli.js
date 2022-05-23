#! /usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const { add, update, revoke } = require("./list");
const util = require('util')
const exec = util.promisify(require('child_process').exec)

program
  .name('list')
  .description('CLI for list and zero knowledge proofs of inclusion and exclusion')
  .version('3.0.0');

program.command('add')
  .description('Add to SMT key-value pair: key is permalink, value is version')
  .argument('<permalink>', 'object permalink')
  .argument('<version>', 'object version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('adding {', permalink, ':' , version, '} pair to SMT relay', relayId);
    await add(permalink, version, relayId);
  });
  
program.command('update')
  .description('Update value of SMT key: key is permalink, value is version')
  .argument('<permalink>', 'object permalink')
  .argument('<version>', 'object version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('updating key', permalink, 'to version' , version, 'on SMT relay', relayId);
  });  

program.command('revoke')
  .description('Revoke SMT key: key is permalink')
  .argument('<permalink>', 'object permalink')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('revoking key', permalink, 'on SMT relay', relayId);
  });  

program.command('verify')
  .description('Verify proof')
  .action(async () => {
    console.log('Verifying proof...');
    let out = 'snarkjs cli call failed';
	try {
      	out = await exec(`snarkjs g16v ./packages/circuit/verification_keyadd.json ./packages/circuit/public.json ./packages/circuit/proof.json`);
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