const { DATA_DIR } = require('@list/config');
const vKeyClaim = require("../circuit/verification_keyclaim.json");
const crypto = require('crypto');
const fs = require('fs').promises;
const buildPoseidon = require("circomlibjs").buildPoseidon;
const { snark } = require("./list");


async function claim(name)
{
	 let claim = {name: name , privateKey:0, permalink:0 };
	 claim.privateKey = BigInt('0x' + crypto.randomBytes(32).toString('hex')).toString(10);
	 let poseidon = await buildPoseidon();
	 const hash = poseidon([claim.privateKey]);
	 claim.permalink = poseidon.F.toObject(hash).toString();
	 console.log("claim", claim);
	 await save(claim, claim.name);	 
	 const {result, proof, publicSignals} = await checkHash(claim.privateKey);
	 if( result &&  (claim.permalink == publicSignals[0]))
	 {
	 	console.log("New permalink of", name, ":", claim.permalink);
	 };

};

async function checkHash(privateKey)
{
	 const input = { inputs: [privateKey] };

	 const {result, proof, publicSignals} = await snark(input, 
	 													"./packages/circuit/claim_js/claim.wasm", 
	 													"./packages/circuit/claim_0001.zkey",
	 													vKeyClaim);
	 return {result, proof, publicSignals};
}	 													
	 													

async function save(data, name) 
{
	const filename =  DATA_DIR + name + ".json"; 
    await fs.writeFile(filename, JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v), function (err) {
		   if (err) return console.log(err);
		 });

};

module.exports = {
	claim
}
