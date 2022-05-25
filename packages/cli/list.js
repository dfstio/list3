
const {RPC_MUMBAI, RELAY, LIST_CONTRACT_ADDRESS, PROOF_DIR } = require('@list/config');
const ListJSON = require("@list/contracts/abi/contracts/list.sol/List.json");
const vKeyAdd = require("../circuit/verification_keyadd.json");
const ethers = require("ethers");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_MUMBAI);
const fs = require('fs').promises;
const snarkjs = require("snarkjs");


async function add(permalink, version, relayId)
{
	 
	 const wallet = new ethers.Wallet(RELAY[relayId]);
	 
	 const signer = wallet.connect(provider);
	 const list = new ethers.Contract(LIST_CONTRACT_ADDRESS, ListJSON, signer);
	 
     const events = await list.queryFilter('Version');
	 const count = events.length;
	 console.log("Records: %d", count);
	 
	 let tree;
	 tree = await newMemEmptyTrie();
	 
	 var i;
	 for( i = 0; i < count; i++)
	 {
	 	if( events[i].args.relayId == relayId )
	 	{
			const _key = events[i].args.permalink;
			const _value = events[i].args.version
			console.log("Record", i, ":", _key.toString(), _value.toString());
			const key = tree.F.e(_key);
			const value = tree.F.e(_value);
			const res = await tree.find(key);
			if( res.found ) await tree.update(key, value);
			else await tree.insert(key, value);
	 	}
	 }
	 

	 console.log("Old root", tree.F.toObject(tree.root).toString());
	 const input = await generateAddInput(tree, permalink, version);
	 
	 const {result, proof, publicSignals} = await snark(input, 
	 													"./packages/circuit/smtadd_js/smtadd.wasm", 
	 													"./packages/circuit/smtadd_0001.zkey",
	 													vKeyAdd);
	 													
	 if( result &&  (tree.F.toObject(tree.root).toString() == publicSignals[0]))
	 {
	 	console.log("New root", tree.F.toObject(tree.root).toString());
	 	console.log("Adding keypair to blockchain...");
	 	const tx = await list.add(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		publicSignals
	 	);
	 
		console.log("TX sent: ", tx.hash);
		const receipt = await tx.wait(1);
		console.log('Transaction receipt', receipt);
		
		const relayData = await list.relays(relayId);
		const newRoot = relayData.roothash;
		if( newRoot.toString() == tree.F.toObject(tree.root).toString()) 
			console.log('New roothash on blockchain is correct: ', newRoot.toString());
		else
			console.error('New roothash on blockchain is WRONG:', newRoot.toString());
	 }
};

async function update(permalink, version, relayId)
{

}

async function revoke(permalink, relayId)
{

}

async function generateAddInput(tree, _key, _value) 
{
    const key = tree.F.e(_key);
    const check = await tree.find(key);
    if( check.found ) { console.error("Cannot add key %d as it is already exist", _key); return; }
    
    const value = tree.F.e(_value)
    
    const res = await tree.insert(key,value);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<16) siblings.push(0);

    const input = {
        oldRoot: tree.F.toObject(res.oldRoot),
        siblings: siblings,
        oldKey: res.isOld0 ? 0 : tree.F.toObject(res.oldKey),
        oldValue: res.isOld0 ? 0 : tree.F.toObject(res.oldValue),
        isOld0: res.isOld0 ? 1 : 0,
        newKey: tree.F.toObject(key),
        newValue: tree.F.toObject(value)
    };
    
    console.log("Input: ");
    console.log( JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
    await save(input, "input")
	return input;
}

async function save(data, name) 
{
	const filename = PROOF_DIR + name + ".json"; 
    await fs.writeFile(filename, JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v), function (err) {
		   if (err) return console.log(err);
		 });

};
async function snark(input, wasm, zkey, vkey) 
{
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));
    await save(proof, "proof");
    
    console.log("publicSignals: ");
    console.log(JSON.stringify(publicSignals, null, 1));
    await save(publicSignals, "public");
    await save(vkey, "verification_key");
    
    const result = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (result === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
    return {result, proof, publicSignals};
}

module.exports = {
    add,
    update,
    revoke
}
