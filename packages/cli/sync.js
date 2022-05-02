
const {RPC_RINKEBY, RPC_MUMBAI, KEY, CONTRACT_ADDRESS } = require('@list/config');
const ListJSON = require("./List.json");
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
	 
	 const key = '0x8750A33948C11E21484fb21e9Ff2D0e238e8527f';
	 const result = await tree.find(key);
	 console.log("Tree root", tree.root, "found", result);
	 await testInclusion(tree, key);
	 
};



async function generateInput(tree, _key) 
{
    const key = tree.F.e(_key);
    const res = await tree.find(key);

    console.log("testInclusion res.found", res.found, "for key", _key);
    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<10) siblings.push(0);

    const input = {
			enabled: 1,
			fnc: 0,
			root: tree.F.toObject(tree.root),
			siblings: siblings,
			oldKey: 0,
			oldValue: 0,
			isOld0: 0,
			key: tree.F.toObject(key),
			value: tree.F.toObject(res.foundValue)
		};

    
    console.log("Input is: ", JSON.stringify(input, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}
