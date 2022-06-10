const { DATA_DIR } = require('@list/config');
const vKeyClaim = require("../circuit/keys/verification_keyclaim.json");
const crypto = require('crypto');
const fs = require('fs').promises;
const buildPoseidon = require("circomlibjs").buildPoseidon;
const { snark } = require("./snark");
const { save, read } = require("./save");


async function claim(name)
{
	 let claim = {name: name , privateKey:0, permalink:0 };
	 claim.privateKey = BigInt('0x' + crypto.randomBytes(32).toString('hex')).toString(10);
	 let poseidon = await buildPoseidon();
	 const hash = poseidon([claim.privateKey]);
	 claim.permalink = poseidon.F.toObject(hash).toString();
	 console.log("claim", claim);
	 await save(DATA_DIR, claim, claim.name);	 
	 const result = await checkHash(claim.privateKey);
	 if( result.isVerificationOK &&  (claim.permalink == result.publicSignals[0]))
	 {
	 	console.log("New permalink of", name, ":", claim.permalink);	 	
	 };

};

async function getPermalink(name)
{
	 const claim = await read(DATA_DIR, name);
	 console.log("claim", claim);
	 const result = await checkHash(claim.privateKey);
	 return result;
};

async function checkHash(privateKey)
{
	 const input = { inputs: [privateKey] };

	 const result = await snark(input, 
								"./packages/circuit/claim_js/claim.wasm", 
								"./packages/circuit/zkeys/claim_0001.zkey",
								vKeyClaim);
	 return result;
}	 													
	 													


module.exports = {
	claim,
	getPermalink
}
