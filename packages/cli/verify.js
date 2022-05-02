
const {RPC_RINKEBY, RPC_MUMBAI, KEY, CONTRACT_ADDRESS, VERIFIER_ADDRESS } = require('@list/config');
const VerifierJSON = require("./Verifier.json");
const ethers = require("ethers");
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_RINKEBY);
const verifier = new ethers.Contract(VERIFIER_ADDRESS, VerifierJSON, provider);


console.log("Start");
main();


async function main()
{
	 const result = await verifier.verifyProof(
["0x26a94aab6861c442c5a6e9a57212fc38e6724ebaf5799160668c281e2872370d", "0x0c2b1802a66a418f13607eb6d87e9d90d0d8f6e71efff782507ddeda36001887"],[["0x10c3fc078dcfa371fc148f858fc3fd1dfba084c4ed0c6065c8e0279e48b965c0", "0x1e416c80c9d7192c5f62e4ee904e7a08dcc57091bf96fe68c5e0a92fc4d3a1dc"],["0x15a1e10e0da169fb986df34236d0d54cd675e7c4bf97f8e4ca3ade70e06ad4fd", "0x135aa0f583a8566267bcfe06b5bb83a783dd80004818a7837b3b106f0b7711d5"]],["0x0d75b677ddc3daf9959e8582bf3fb5cc6ba5ac5eac0f2ee8acc7ee81d8d983c0", "0x0b005e033b1c7455b65d11424c5d789880fba5ea68b3f654a1cdb1d283094a30"]

);
	 

	 console.log("Result: ", result);
};