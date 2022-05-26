const {RPC_GOERLI, KEY_OWNER, SCORE_ADDRESS } = require('@list/config');
const ScoreJSON = require("@list/contracts/abi/contracts/score.sol/Score.json");
const ethers = require("ethers");
const { verifierProof } = require("./list");
const { getProof } = require("./ethereum");


async function score(permalink, version, relayId)
{
	const inputData =  await getProof(relayId);
	const result = await verifierProof(permalink, relayId);
	const proof = result.proof;
	
	const wallet = new ethers.Wallet(KEY_OWNER);
	const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	const signer = wallet.connect(ethereumprovider);
	const Score = new ethers.Contract(SCORE_ADDRESS, ScoreJSON, signer);
	
	console.log("Calling Score contract...");
	const oldScore = await Score.score(permalink);
	console.log("Old score is", oldScore.toString());
	const tx = await Score.addScore(
			permalink,
			version,
			relayId,
			inputData,
	 		[proof.pi_a[0], proof.pi_a[1]],
	 		[[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
	 		[proof.pi_c[0],proof.pi_c[1]],
	 		result.publicSignals);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction receipt', receipt);
	console.log("Waiting for 2 confirmations...");
	await tx.wait(2);
	const newScore = await Score.score(permalink);
	console.log("New score is", newScore.toString());
}



module.exports = {
	score
}