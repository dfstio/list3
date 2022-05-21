
const {RPC_RINKEBY, RPC_MUMBAI, KEY, LIST_CONTRACT_ADDRESS } = require('@list/config');
const ListJSON = require("../contracts/abi/contracts/list.sol/List.json");
const ethers = require("ethers");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;

const provider = new ethers.providers.StaticJsonRpcProvider(RPC_MUMBAI);
const wallet = new ethers.Wallet(KEY);
const signer = wallet.connect(provider);
const list = new ethers.Contract(LIST_CONTRACT_ADDRESS, ListJSON, signer);



main();



async function main()
{
	 const count = await list.getRecordsCount();
	 console.log("Records: %d", count - 1);
	 
	 let tree;
	 tree = await newMemEmptyTrie();
	 
	 var i;
	 for( i = 1; i < count; i++)
	 {
	 	const record = await list.records(i);
	 	console.log("Record %d", i, record);
	 	await tree.insert(i, record.version);
	 }
	 
	 console.log("Tree root", tree.root);
	 await list.sync(tree.root, count);
	 
	 
	 
/*
	 const key1 = '277';
	 const key2 = '300';


	 await generateInput(tree, key1);
	 await generateInput(tree, key2);
*/	 
};



async function generateInput(tree, _key) 
{
    const key = tree.F.e(_key);
    const res = await tree.find(key);

    console.log("Key found:", res.found, "for key", _key);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<10) siblings.push(0);

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

    
    console.log("Input is: ", JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}
