const {RPC_GOERLI, RPC_MUMBAI, RPC_AWS_ENDPOINT, RPC_AWS_PASSWORD, RPC_AWS_USER, 
		KEY_OWNER, BRIDGE_MUMBAI, BRIDGE_GOERLI } = require('@list/config');
const RPC_AWS =  {url: RPC_AWS_ENDPOINT,  user: RPC_AWS_USER, password: RPC_AWS_PASSWORD};
const BridgeJSON = require("@list/contracts/abi/contracts/bridge.sol/Bridge.json");
const ethers = require("ethers");


async function bridge()
{	
	const awsprovider = new ethers.providers.JsonRpcProvider(RPC_AWS);
	console.log("Getting latest AWS block information...");
	const block = await awsprovider.getBlock("latest");
	console.log("Block:");
	console.log(JSON.stringify(block, null, 1));
	
	console.log("Sealing on mumbai...");
	await seal( RPC_MUMBAI, BRIDGE_MUMBAI, block);
	
	//console.log("Sealing on goerli...");
	//await seal( RPC_GOERLI, BRIDGE_GOERLI, block);
}

async function seal(rpc, contract, block)
{
	const wallet = new ethers.Wallet(KEY_OWNER);
	const address = wallet.address;
	const provider = new ethers.providers.JsonRpcProvider(rpc);
	const signer = wallet.connect(provider);
	const bridge = new ethers.Contract(contract, BridgeJSON, signer);
	const tx = await bridge.seal(block.number, block.timestamp, block.hash);
	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber);
}

async function getBlock()
{	
	const provider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	const block = await provider.getBlock("latest");
	let date = new Date(block.timestamp*1000);
	console.log("Block:", block.number, date.toUTCString());
	//console.log(JSON.stringify(block.number, null, 1));

};

module.exports = {
	bridge,
	getBlock
}