
const hre = require("hardhat"); 
const { SCOREAWS_ADDRESS } = require('@list/config');
const ScoreJSON = require("@list/contracts/abi/contracts/aws.sol/ScoreAWS.json");


async function main() {
	const accounts = await hre.ethers.getSigners();
	const owner = accounts[0].address;
	//console.log("Deployer address:", deployer);
  
	const balance = await hre.ethers.provider.getBalance("0xA5833655C441D486FB1DabCeb835f44DA73bf5E7");
	console.log("Balance:", balance/1000000000000000000);
  
	const Score = new hre.ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, accounts[0]);
	const oldScore = await Score.score(77);
	console.log("Old score is", oldScore.toString());
  
  	const tx = await Score.addScore(77);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction receipt', receipt);
	console.log("Waiting for 2 confirmations...");
	await tx.wait(2);
	const newScore = await Score.score(77);
	console.log("New score is", newScore.toString());

}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
