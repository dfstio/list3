const {RPC_AWS, CHAINID_AWS, KEY_OWNER, SCOREAWS_ADDRESS } = require('@list/config');
const ScoreJSON = require("@list/contracts/abi/contracts/aws.sol/ScoreAWS.json");
const ethers = require("ethers");
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
	const tx = await Score.addScore(permalink);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber);
	console.log("Waiting for 2 confirmations...");
	await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
}


module.exports = {
	scoreaws
}