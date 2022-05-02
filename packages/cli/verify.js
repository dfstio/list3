
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
["0x2b29c02c9bcda1e2c56b92cda12dfe1a691154a8241c47aa4eaf003499ad3d93", "0x0eb93b84fa428981a33d4223b53d3a44ab6ab862c4b6bc84474a11e55e9e34d4"],[["0x03d1add5105875b01ae7c2b163fd39331f55bc9bee9485d179fd8580502cf006", "0x1578552e93c5006c797531f038e613c09a25b8dde8dde12effaf0360810baa26"],["0x06c90658e969ed6e522037a39ceb8a6d19e10929e86836354a17268723bd98f0", "0x1e60d9dae5dfadd9a7eb23703246bd3847a0eb38cf47bb7282ef400dc9910c06"]],["0x00b2f90a4ff56bbe5295f6f2055d109671c79679f98ca8d9faf90d0628701076", "0x220c35c17a6d73c46e1f8facf15cfd072bc8c1e3ae53be1760e9d5375e7aa9be"],
["0x2477eb0beba2645c5cbe1d38aef6a2eb21c6410b046c568292804750ad2e4893","0x0000000000000000000000008750a33948c11e21484fb21e9ff2d0e238e8527f","0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000000"]
);
	 

	 console.log("Result: ", result);
};