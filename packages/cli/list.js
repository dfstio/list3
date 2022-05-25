const {RPC_MUMBAI, RPC_GOERLI, RELAY, LIST_CONTRACT_ADDRESS, 
		VERIFIER_ADDRESS, PROOF_DIR } = require('@list/config');
const ListJSON = require("@list/contracts/abi/contracts/list.sol/List.json");
const VerifierJSON = require("@list/contracts/abi/contracts/verifier.sol/Verifier.json");
const vKey = require("@list/circuit/verification_key.json");
const vKeyAdd = require("@list/circuit/verification_keyadd.json");
const vKeyUpdate = require("@list/circuit/verification_keyupdate.json");
const vKeyRevoke = require("@list/circuit/verification_keyrevoke.json");
const vKeyAddRevoked = require("@list/circuit/verification_keyaddrevoked.json");
const ethers = require("ethers");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_MUMBAI);
const fs = require('fs').promises;
const snarkjs = require("snarkjs");
const { snark } = require("./snark");
const { getPermalink } = require("./claim");


async function gettree(relayId)
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
	
	return {tree, list};

}


async function add(name, version, relayId)
{
	 
	 let {tree, list} = await gettree(relayId); 	
	 console.log("Old root", tree.F.toObject(tree.root).toString());
	 
	 const claim = await getPermalink(name); 
	 console.log("getPermalink", claim);
	 const permalink = claim.publicSignals[0]; // out signal of claim circuit 
	 const input = await generateAddInput(tree, permalink, version);
	 
	 const result = await snark(input, 
								"./packages/circuit/smtadd_js/smtadd.wasm", 
								"./packages/circuit/smtadd_0001.zkey",
								vKeyAdd);
	 													
	 if( result.isVerificationOK &&  (tree.F.toObject(tree.root).toString() == result.publicSignals[0]))
	 {
	 	console.log("New root", tree.F.toObject(tree.root).toString());
	 	console.log("Adding claim version to blockchain...");
	 	const proof = result.proof;
	 	const cproof = claim.proof;
	 	const tx = await list.add(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals,
	 		[cproof.pi_a[0], cproof.pi_a[1]],
	 		[[cproof.pi_b[0][1],cproof.pi_b[0][0]],[cproof.pi_b[1][1],cproof.pi_b[1][0]]],
	 		[cproof.pi_c[0],cproof.pi_c[1]],
	 		claim.publicSignals
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

async function update(name, version, relayId)
{
	 let {tree, list} = await gettree(relayId); 	
	 console.log("Old root", tree.F.toObject(tree.root).toString());
	 
	 const claim = await getPermalink(name); 
	 console.log("getPermalink", claim);
	 const permalink = claim.publicSignals[0]; // out signal of claim circuit 
	 const input = await generateUpdateInput(tree, permalink, version);
	 
	 const result = await snark(input, 
								"./packages/circuit/smtupdate_js/smtupdate.wasm", 
								"./packages/circuit/smtupdate_0001.zkey",
								vKeyUpdate);
	 													
	 if( result.isVerificationOK &&  (tree.F.toObject(tree.root).toString() == result.publicSignals[0]))
	 {
	 	console.log("New root", tree.F.toObject(tree.root).toString());
	 	console.log("Updating claim version on blockchain...");
	 	const proof = result.proof;
	 	const cproof = claim.proof;
	 	const tx = await list.update(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals,
	 		[cproof.pi_a[0], cproof.pi_a[1]],
	 		[[cproof.pi_b[0][1],cproof.pi_b[0][0]],[cproof.pi_b[1][1],cproof.pi_b[1][0]]],
	 		[cproof.pi_c[0],cproof.pi_c[1]],
	 		claim.publicSignals
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

}

async function isIncluded(tree, _key) 
{
    const key = tree.F.e(_key);
    const check = await tree.find(key);
    return check.found; 
}
    
    
async function revoke(name, relayId)
{
	 const version = 1;
	 let {tree, list} = await gettree(relayId); 	
	 console.log("Old root", tree.F.toObject(tree.root).toString());
	 
	 const claim = await getPermalink(name); 
	 console.log("getPermalink", claim);
	 const permalink = claim.publicSignals[0]; // out signal of claim circuit 
	 const found = await isIncluded(tree, permalink)
	 if( found == false) 
	 {  
	 	console.log("Adding revoked claim");
	 	await addrevoked(tree, list, claim, permalink, name, relayId); 
	 	return;
	 }
	 
	 const input = await generateRevokeInput(tree, permalink);
	 
	 const result = await snark(input, 
								"./packages/circuit/smtrevoke_js/smtrevoke.wasm", 
								"./packages/circuit/smtrevoke_0001.zkey",
								vKeyRevoke);
	 													
	 if( result.isVerificationOK &&  (tree.F.toObject(tree.root).toString() == result.publicSignals[0]))
	 {
	 	console.log("New root", tree.F.toObject(tree.root).toString());
	 	console.log("Revoking claim on blockchain...");
	 	const proof = result.proof;
	 	const cproof = claim.proof;
	 	const tx = await list.revoke(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals,
	 		[cproof.pi_a[0], cproof.pi_a[1]],
	 		[[cproof.pi_b[0][1],cproof.pi_b[0][0]],[cproof.pi_b[1][1],cproof.pi_b[1][0]]],
	 		[cproof.pi_c[0],cproof.pi_c[1]],
	 		claim.publicSignals
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

}

async function addrevoked(tree, list, claim, permalink, name, relayId)
{ 
	 const input = await generateAddRevokedInput(tree, permalink);
	 
	 const result = await snark(input, 
								"./packages/circuit/smtaddrevoked_js/smtaddrevoked.wasm", 
								"./packages/circuit/smtaddrevoked_0001.zkey",
								vKeyAddRevoked);
	 													
	 if( result.isVerificationOK &&  (tree.F.toObject(tree.root).toString() == result.publicSignals[0]))
	 {
	 	console.log("New root", tree.F.toObject(tree.root).toString());
	 	console.log("Adding revoked claim to blockchain...");
	 	const proof = result.proof;
	 	const cproof = claim.proof;
	 	const tx = await list.addrevoked(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals,
	 		[cproof.pi_a[0], cproof.pi_a[1]],
	 		[[cproof.pi_b[0][1],cproof.pi_b[0][0]],[cproof.pi_b[1][1],cproof.pi_b[1][0]]],
	 		[cproof.pi_c[0],cproof.pi_c[1]],
	 		claim.publicSignals
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

async function verify(permalink, relayId)
{
	 
	 let {tree, list} = await gettree(relayId); 	
	 const input = await generateVerifierInput(tree, permalink);
	 
	 const result = await snark(input, 
								"./packages/circuit/smt_js/smt.wasm", 
								"./packages/circuit/smt_0001.zkey",
								vKey);
	 													
	 if( result.isVerificationOK && (tree.F.toObject(tree.root).toString() == result.publicSignals[0]))
	 {
	 	console.log("Verifying on Goerli...");
	 	const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	 	const verifier = new ethers.Contract(VERIFIER_ADDRESS, VerifierJSON, ethereumprovider);
	 	const proof = result.proof;
	 	const verified = await verifier.verifyProof(
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals
	 	);
	 
		console.log("Verified: ", verified);
	 }
};

async function verifierProof(permalink, relayId)
{
	 
	 let {tree, list} = await gettree(relayId); 	
	 const input = await generateVerifierInput(tree, permalink);
	 
	 const result = await snark(input, 
								"./packages/circuit/smt_js/smt.wasm", 
								"./packages/circuit/smt_0001.zkey",
								vKey);
	 return result;												
};

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
	return input;
}

async function generateUpdateInput(tree, _key, _value) 
{
    const key = tree.F.e(_key);
    const check = await tree.find(key);
    if( !check.found ) { console.error("Cannot update key %d as it is not exist", _key); return; }
    
    const value = tree.F.e(_value)
    
    const res = await tree.update(key,value);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<16) siblings.push(0);

    const input = {
        oldRoot: tree.F.toObject(res.oldRoot),
        siblings: siblings,
        oldKey: tree.F.toObject(res.oldKey),
        oldValue: tree.F.toObject(res.oldValue),
        isOld0: 0,
        newKey: tree.F.toObject(key),
        newValue: tree.F.toObject(value)
    };
    
    console.log("Input: ");
    console.log( JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
	return input;
}

async function generateRevokeInput(tree, _key) 
{
    const key = tree.F.e(_key);
    const check = await tree.find(key);
    if( !check.found ) { console.error("Cannot revoke key %d as it is not exist", _key); return; }
    
    const value = tree.F.e(1)
    
    const res = await tree.update(key,value);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<16) siblings.push(0);

    const input = {
        oldRoot: tree.F.toObject(res.oldRoot),
        siblings: siblings,
        oldKey: tree.F.toObject(res.oldKey),
        oldValue: tree.F.toObject(res.oldValue),
        isOld0: 0,
        newKey: tree.F.toObject(key),
        newValue: tree.F.toObject(value)
    };
    
    console.log("Input: ");
    console.log( JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
	return input;
}

async function generateAddRevokedInput(tree, _key) 
{
    const key = tree.F.e(_key);
    const check = await tree.find(key);
    if( check.found ) { console.error("Cannot add revoked key %d as it is already exist", _key); return; }
    
    const value = tree.F.e(1)
    
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
	return input;
}

async function generateVerifierInput(tree, _key) 
{
	const key = tree.F.e(_key);
    const res = await tree.find(key);

    console.log("Key found:", res.found, "for key", _key);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<16) siblings.push(0);

    const input = {
			enabled: 1,
			fnc: res.found? 0 : 1,
			root: tree.F.toObject(tree.root),
			siblings: siblings,
			oldKey: res.found? 0 : (res.isOld0 ? 0 : tree.F.toObject(res.notFoundKey)),
			oldValue: res.found? 0 : (res.isOld0 ? 0 : tree.F.toObject(res.notFoundValue)),
			isOld0: res.found? 0 : (res.isOld0 ? 1 : 0),
			key: tree.F.toObject(key),
			value: res.found? tree.F.toObject(res.foundValue) : 0
		};
		
    console.log("Input: ");
    console.log( JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
	return input;
}

async function save(data, name) 
{
	const filename = PROOF_DIR + name + ".json"; 
    await fs.writeFile(filename, JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v), function (err) {
		   if (err) return console.log(err);
		 });

};



module.exports = {
    add,
    update,
    revoke,
    verify,
    verifierProof
}
