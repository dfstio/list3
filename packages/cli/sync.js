
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
	 
	 const result = await tree.find('0x8750A33948C11E21484fb21e9Ff2D0e238e8527f');
	 console.log("Tree root", tree.root, "found", result);
	 
};