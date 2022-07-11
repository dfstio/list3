const {RPC_L3_ENDPOINT, RPC_L3_PASSWORD, RPC_L3_USER, CHAINID_AWS, 
		 CHAINID_L3, KEY_OWNER, SCOREAWS_ADDRESS, SCOREAWS_MUMBAI, RPC_MUMBAI } = require('@list/config');
const RPC_L3 =  {url: RPC_L3_ENDPOINT,  user: RPC_L3_USER, password: RPC_L3_PASSWORD};
//const RPC_AWS =  {url: RPC_AWS_ENDPOINT,  user: RPC_AWS_USER, password: RPC_AWS_PASSWORD};

const RPC_L3_AXIOS = "https://" + RPC_L3_USER + ":" + RPC_L3_PASSWORD + "@" + RPC_L3_ENDPOINT.replace("https://", "");



const ScoreJSON = require("@list/contracts/abi/contracts/aws.sol/ScoreAWS.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const axios = require('axios');
const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_L3);

const { proofTest } = require("./awsproof");
const { bridge, getBlock } = require("./bridge");

async function scoreaws(permalink, count)
{	
    if( count == 1) { await scoreaws2(permalink); return };
    
	const wallet = new ethers.Wallet(KEY_OWNER);
	const signer = wallet.connect(ethereumprovider);
	const Score = new ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, signer);
	let i = 0;
	while( i < count ) { await scoreaws3(permalink, Score ); await bridge(); await proofTest(permalink); i++ }

};

async function scoreaws3(permalink, Score)
{	
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	const tx = await Score.addScore(permalink);
	console.log("TX sent: ", tx.hash);
	//const receipt = await tx.wait(1);
	//console.log('Transaction block:', receipt.blockNumber);
}

async function setscore(permalink, value)
{	
	const wallet = new ethers.Wallet(KEY_OWNER);
	const mumbaiprovider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
	console.log("Calling Score L3 contract...");
	const balance = await mumbaiprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance/1000000000000000000);
	
	const signer = wallet.connect(mumbaiprovider);
	const Score = new ethers.Contract(SCOREAWS_MUMBAI, ScoreJSON, signer);
	
	
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	await ethproof(permalink);
	let gas = await mumbaiprovider.getFeeData();


	const network = await mumbaiprovider.getNetwork();

	
	// handle mumbai gas error
	if( network.chainId == 80001) 
	{
		const isProd = false;
		const { data } = await axios({
        	method: 'get',
        	url: isProd
        		? 'https://gasstation-mainnet.matic.network/v2'
        		: 'https://gasstation-mumbai.matic.today/v2',
    	})
    	console.log("Mumbai current gas rates:", data.fast);
		gas.maxFeePerGas = ethers.utils.parseUnits(
					`${Math.ceil(data.fast.maxFee)}`,
					'gwei'
				)
		gas.maxPriorityFeePerGas = ethers.utils.parseUnits(
					`${Math.ceil(data.fast.maxPriorityFee)}`,
					'gwei'
				)
	}			
	console.log( "Gas params: maxFeePerGas",  (gas.maxFeePerGas/1000000000).toString(), "maxPriorityFeePerGas", (gas.maxPriorityFeePerGas/1000000000).toString());

	const tx = await Score.setScore(permalink, value,
			{	 
			  maxFeePerGas: gas.maxFeePerGas * 4 , 
			  maxPriorityFeePerGas: gas.maxPriorityFeePerGas * 4 });


	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber, "gas used", receipt.cumulativeGasUsed.toString()); //.blockNumber
	//console.log("Waiting for 2 confirmations...");
	//await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
	await ethproof(permalink);
	const balance2 = await mumbaiprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance2/1000000000000000000);
	console.log("Fee paid", (balance - balance2)/1000000000000000000);
	await bridge(); 
	await proofTest(permalink);
}

async function setscore1(permalink, value)
{	
	const wallet = new ethers.Wallet(KEY_OWNER);

	console.log("Calling Score L3 contract...");
	const balance = await ethereumprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance/1000000000000000000);
	
	const signer = wallet.connect(ethereumprovider);
	const Score = new ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, signer);
	
	
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	await ethproof(permalink);
	let gas = await ethereumprovider.getFeeData();
	console.log( "Gas params: maxFeePerGas",  (gas.maxFeePerGas/1000000000).toString(), "maxPriorityFeePerGas", (gas.maxPriorityFeePerGas/1000000000).toString());

	const tx = await Score.setScore(permalink, value);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber, "gas used", receipt.cumulativeGasUsed.toString()); //.blockNumber
	//console.log("Waiting for 2 confirmations...");
	//await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
	await ethproof(permalink);
	const balance2 = await ethereumprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance2/1000000000000000000);
	console.log("Fee paid", (balance - balance2)/1000000000000000000);
	await bridge(); 
	await proofTest(permalink);
}
async function scoreaws2(permalink)
{	
	const wallet = new ethers.Wallet(KEY_OWNER);

	console.log("Calling Score L3 contract...");
	const balance = await ethereumprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance/1000000000000000000);
	
	const signer = wallet.connect(ethereumprovider);
	const Score = new ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, signer);
	
	
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	await ethproof(permalink);
	let gas = await ethereumprovider.getFeeData();
	console.log( "Gas params: maxFeePerGas",  (gas.maxFeePerGas/1000000000).toString(), "maxPriorityFeePerGas", (gas.maxPriorityFeePerGas/1000000000).toString());

	const tx = await Score.addScore(permalink);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber, "gas used", receipt.cumulativeGasUsed.toString()); //.blockNumber
	//console.log("Waiting for 2 confirmations...");
	//await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
	await ethproof(permalink);
	const balance2 = await ethereumprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance2/1000000000000000000);
	console.log("Fee paid", (balance - balance2)/1000000000000000000);
}

async function ethproof(permalink)
{	
	
	let permalinkHex = BigInt(permalink).toString(16);
	//console.log("ethproof: ", permalink, permalinkHex, permalinkHex.length);
	while( permalinkHex.length < 64) permalinkHex = "0" + permalinkHex;
	
	// position of map versions is 0x97
	const key = "0x" + toHex(keccak256(hexToBytes(permalinkHex +
								 "0000000000000000000000000000000000000000000000000000000000000000"))).toString();
   
	const data = {"jsonrpc":"2.0",
				  "method":"eth_getProof",
				  "params":[
						SCOREAWS_ADDRESS,
						[key],
						"latest"],
				  "id":1 };
		  
	//console.log("ethproof: ", data, key);
	const response = await axios.post(RPC_L3_AXIOS, data);
	let value = response.data.result.storageProof[0].value.toString();
	console.log("value: ", value);
	//while( value.length < 64) value = "0" + value;
	//const version = { relayId: "0x" + value.slice(0,32), version: "0x" + value.slice(32)}
	//console.log("version: ", version);
	//console.log("proof: ", response.data); //.result.storageProof[0]
	//console.log("storageProof: ", response.data.result.storageProof[0]);
	return;
};


module.exports = {
	scoreaws, 
	setscore
}