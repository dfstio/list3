
const {RPC_RINKEBY, RPC_MUMBAI, KEY, CONTRACT_ADDRESS } = require('@list/config');
const ListJSON = require("../contracts/abi/contracts/list.sol/List.json");
const ethers = require("ethers");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;

const provider = new ethers.providers.StaticJsonRpcProvider(RPC_MUMBAI);
const list = new ethers.Contract(CONTRACT_ADDRESS, ListJSON, provider);



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
	 	await tree.insert(record.adr, record.version);
	 }
	 
	 const key1 = '0x8750A33948C11E21484fb21e9Ff2D0e238e8527f';
	 const key2 = '0xbDEBAb0a14CDa02c196bDC2C2490D96d3DfC6a61';

	 console.log("Tree root", tree.root);
	 await generateInput(tree, key1);
	 await generateInput(tree, key2);
	 
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
