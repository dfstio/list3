#! /usr/bin/env node
const { PROOF_DIR } = require('@list/config');
const { Command } = require('commander');
const program = new Command();
const { add, madd, update, revoke, verify } = require("./list");
const { claim } = require("./claim");
const { score, seal } = require("./score");
const { scoreaws } = require("./scoreaws");
const { awsproof } = require("./awsproof");
const { bridge } = require("./bridge");
const { checkEthereum, ethproof } = require("./ethereum");
const { sample } = require("./smt");

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
  
program.command('madd')
  .description('Add to mobile SMT key-value pair: key is permalink of claim, value is version')
  .argument('<name>', 'claim name')
  .argument('<version>', 'claim version, must be 2 or bigger')
  .option('-relay <number>', 'relayId to use')
  .action(async (name, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('adding {', name, ':' , version, '} pair to SMT relay', relayId);
    await madd(name, version, relayId);
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
  .description('Verify ZK proof of inclusion or exclusion on Goerli')
  .argument('<permalink>', 'claim permalink')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('Verifying claim', permalink, 'on Goerli, SMT relay', relayId);
    await verify(permalink, relayId);
  });    
  
program.command('score')
  .description('Example: Add score with transaction on Goerli with ZK proof of inclusion or exclusion')
  .argument('<permalink>', 'claim permalink')
  .argument('<version>', 'claim version')
  .option('-relay <number>', 'relayId to use')
  .action(async (permalink, version, options) => {
  	const relayId = options.Relay? options.Relay : 1 ;
    console.log('Adding score to ', permalink, "version", version, "SMT relay", relayId);
    await score(permalink, version, relayId);
  });    
  
  
program.command('scoreaws')
  .description('Example: Add score with transaction on AWS')
  .argument('<permalink>', 'claim permalink')
  .action(async (permalink) => {
    console.log('Adding AWS score to ', permalink);
    await scoreaws(permalink);
  });  
  

program.command('bridge')
  .description('Sealing blocknumber and blockhash on Mumbai and Goerli')
  .action(async () => {
    console.log('Sealing blocknumber and blockhash on Mumbai and Goerli... ');
    await bridge();
  });    
  
program.command('awsproof')
  .description('Checking value on Mumbai and Goerli')
  .action(async () => {
    console.log('Checking value on Mumbai and Goerli... ');
    await awsproof(80, 102785);
  });  
    
program.command('seal')
  .description('Example 2: Add score with transaction on Goerli with fresh seal on Mumbai')
  .argument('<permalink>', 'claim permalink')
  .option('-validity <number>', 'validity of seal in hours, default is 1 hour')
  .action(async (permalink, options) => {
    const validity = options.Validity? options.Validity : 1 ;
    console.log('Adding score to ', permalink, "with seal validity", validity, "hours");
    await seal(permalink, validity);
  });    
  
program.command('ethproof')
  .description('Example 3: Add score with transaction on Goerli with fresh seal on Mumbai')
  .argument('<permalink>', 'claim permalink')
  .option('-validity <number>', 'validity of seal in hours, default is 1 hour')
  .action(async (permalink, options) => {
    const validity = options.Validity? options.Validity : 1 ;
    console.log('Adding score to ', permalink, "with seal validity", validity, "hours");
    await ethproof(permalink, validity);
  });    
     
program.command('sample')
  .description('Example: Create several SMT trees and save them to files')
  .action(async () => {
    console.log('Creating SMTs...');
    await sample();
  });  
  
program.command('snarkverify')
  .description('Verify proof in ./proof folder by executing snarkjs')
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