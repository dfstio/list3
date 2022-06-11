const {RPC_AWS_ENDPOINT, RPC_AWS_PASSWORD, RPC_AWS_USER, CHAINID_AWS, KEY_OWNER, SCOREAWS_ADDRESS } = require('@list/config');
const RPC_AWS =  {url: RPC_AWS_ENDPOINT,  user: RPC_AWS_USER, password: RPC_AWS_PASSWORD};

const ScoreJSON = require("@list/contracts/abi/contracts/aws.sol/ScoreAWS.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const axios = require('axios');


async function scoreaws(permalink)
{	
	const wallet = new ethers.Wallet(KEY_OWNER);
	const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_AWS);
	console.log("Calling Score AWS contract...");
	const balance = await ethereumprovider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance is", balance/1000000000000000000);
	
	const signer = wallet.connect(ethereumprovider);
	const Score = new ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, signer);
	
	
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	await ethproof(permalink);
	const tx = await Score.addScore(permalink);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber);
	console.log("Waiting for 2 confirmations...");
	await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
	await ethproof(permalink);
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
	const response = await axios.post(RPC_AWS_ENDPOINT, data);
	let value = response.data.result.storageProof[0].value.slice(2).toString();
	console.log("value: ", value);
	//while( value.length < 64) value = "0" + value;
	//const version = { relayId: "0x" + value.slice(0,32), version: "0x" + value.slice(32)}
	//console.log("version: ", version);
	//console.log("proof: ", response.data); //.result.storageProof[0]
	//console.log("storageProof: ", response.data.result.storageProof[0]);
	return;
};


module.exports = {
	scoreaws
}