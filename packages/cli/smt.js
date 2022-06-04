const { DATA_DIR } = require('@list/config');
const { save, read } = require("./save");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;



async function sample()
{	 
	let tree;
	tree = await newMemEmptyTrie();
	await tree.insert(1, 2);
	//console.log("tree (1,2):", tree.db.nodes);
	await tree.insert(5, 6);
	//console.log("tree (1,2) (5,6):", tree.db.nodes);
	const res = await tree.find(5);
	console.log("Found:", tree.F.toObject(res.foundValue) );
	let i;
	let key;
	for( i = 0; i < 10; i++ )
	{
		key = i * 5 + 50;
		await tree.insert(key, i * 3 + 6);
	}
	const resAdd = await tree.find(key);
	console.log("Insert i:", i, "length", resAdd.siblings.length );
	
	const name = tree.F.toObject(tree.root).toString();
	//await save(DATA_DIR, tree.db.nodes, name, true);
	
	console.log("Reading..");
	//let newNodes = await read(DATA_DIR, name, true); 
	//console.log("tree 1", name, ":",  newNodes);
	let newTree = await newMemEmptyTrie();
	newTree.db.nodes = tree.db.nodes;
	//console.log("tree 2", name, ":",  newTree.db.nodes);
	newTree.db.setRoot(tree.root);
	newTree.root = tree.root;
	const res1 = await newTree.find(5);
	console.log("Found new:", newTree.F.toObject(res1.foundValue) );

};

module.exports = {
	sample
}
	 
