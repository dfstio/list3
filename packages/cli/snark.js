const { PROOF_DIR } = require('@list/config');
const fs = require('fs').promises;
const snarkjs = require("snarkjs");
const { save } = require("./save");


async function snark(input, wasm, zkey, vkey) 
{
	const start1 = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);
    const end1 = Date.now();
    console.log("Time generating proof", (end1-start1)/1000, "sec");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));
    await save(PROOF_DIR, proof, "proof");
    await save(PROOF_DIR, input, "input");
    
    console.log("publicSignals: ");
    console.log(JSON.stringify(publicSignals, null, 1));
    await save(PROOF_DIR, publicSignals, "public");
    await save(PROOF_DIR, vkey, "verification_key");
    
    const isVerificationOK = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (isVerificationOK === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
    let result = {isVerificationOK, proof, publicSignals}
    return result;
}

module.exports = {
    snark
}
