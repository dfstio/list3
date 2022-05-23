
const {RPC_MUMBAI, RELAY, LIST_CONTRACT_ADDRESS } = require('@list/config');
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
	 	const _key = events[i].args.permalink;
	 	const _value = events[i].args.version
	 	console.log("Record", i, ":", _key.toString(), _value.toString());
	 	const key = tree.F.e(_key);
	 	const value = tree.F.e(_value);
	 	const res = await tree.find(key);
	 	if( res.found ) await tree.update(key, value);
	 	else await tree.insert(key, value);
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
    while (siblings.length<10) siblings.push(0);

    const input = {
        fnc: [1,0],
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
    await fs.writeFile("./data/add-input.json", JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v), function (err) {
		   if (err) return console.log(err);
		 });
	return input;
}

async function snark(input, wasm, zkey, vkey) 
{
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));
    
    console.log("publicSignals: ");
    console.log(JSON.stringify(publicSignals, null, 1));
    
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
