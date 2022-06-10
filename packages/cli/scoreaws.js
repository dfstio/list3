const {RPC_AWS, CHAINID_AWS, KEY_OWNER, SCOREAWS_ADDRESS } = require('@list/config');
const ScoreJSON = require("@list/contracts/abi/contracts/aws.sol/ScoreAWS.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const axios = require('axios');
// Fill these in to test, ex. remove @RPC_ENDPOINT@
let USER = "u0csuzum5q";
let PASS = "inHQPY81sbheeExCDCC6cfCbvNDAW7qyn-J_wCbj7es";
let RPC_ENDPOINT = "https://u0csuzum5q:inHQPY81sbheeExCDCC6cfCbvNDAW7qyn-J_wCbj7es@u0xly6ruwy-u0i0jpm4rx-rpc.us0-aws.kaleido.io/"; // With https://

// HTTP Provider Example
let url = {url: RPC_ENDPOINT, user: USER, password: PASS};



async function scoreaws(permalink)
{	
	const wallet = new ethers.Wallet(KEY_OWNER);
	const aws = { name: "list", chainId: 1169565385}
	const ethereumprovider = new ethers.providers.JsonRpcProvider(url);
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
	const response = await axios.post(RPC_ENDPOINT, data);
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