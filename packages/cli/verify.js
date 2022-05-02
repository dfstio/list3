
const {RPC_RINKEBY, RPC_MUMBAI, KEY, CONTRACT_ADDRESS, VERIFIER_ADDRESS } = require('@list/config');
const VerifierJSON = require("../contracts/abi/contracts/verifier.sol/Verifier.json");
const ethers = require("ethers");
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_RINKEBY);
const verifier = new ethers.Contract(VERIFIER_ADDRESS, VerifierJSON, provider);


console.log("Start");
main();


async function main()
{
	 const result = await verifier.verifyProof(
	 ["0x1076cd5690848166c905f8149977d7228401cfda497a90559f36c03eed3114b1", 
	 "0x151d48c4a6b04739e44fb61153f3d1362ba2bd3a5ccd345e5cdbad835a00fc7c"],
	 [["0x05490d4089ae1bf5db01904219c14efae9aaf7803dfbd717260b9dfe8e8cd6b7", 
	 "0x04a29ecb6f6a6a1f3dddf988a18bb319c5dced331acb8778474253c7e1392823"],
	 ["0x266b93d2649a1d17dfb672db57bd1baeaadecd5308a4b4f149001b899673866c", 
	 "0x0bb51d30c356da30d7dda392ba19f2cc5d8698da1744241b031624d4d6e2ab48"]],
	 ["0x108ada89865599661ad528d9420e5686ac81a77e883912778f84e9b29448e913", 
	 "0x26ac74899bc9f5a128ccdb221c6218d475f311a3abad8a35939c6f4c9def2db3"],
	 ["0x2477eb0beba2645c5cbe1d38aef6a2eb21c6410b046c568292804750ad2e4893",
	 "0x000000000000000000000000bdebab0a14cda02c196bdc2c2490d96d3dfc6a61",
	 "0x0000000000000000000000000000000000000000000000000000000000000000",
	 "0x0000000000000000000000000000000000000000000000000000000000000001"]
	 );

	 console.log("Result: ", result);
};