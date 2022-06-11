const {RPC_AWS_ENDPOINT, SCOREAWS_ADDRESS } = require('@list/config');

const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const axios = require('axios');
const GetAndVerify =  require('./getAndVerify.js')



async function awsproof(permalink, blockNumber)
{	
	
	let permalinkHex = BigInt(permalink).toString(16);
	//console.log("ethproof: ", permalink, permalinkHex, permalinkHex.length);
	while( permalinkHex.length < 64) permalinkHex = "0" + permalinkHex;
	
	// position of map versions is 0x97
	const key = "0x" + toHex(keccak256(hexToBytes(permalinkHex +
								 "0000000000000000000000000000000000000000000000000000000000000000"))).toString();
	const block = "0x" + blockNumber.toString('16');
   
	const data = {"jsonrpc":"2.0",
				  "method":"eth_getProof",
				  "params":[
						SCOREAWS_ADDRESS,
						[key],
						block],
				  "id":1 };
		  
	//console.log("ethproof: ", data);

	const response = await axios.post(RPC_AWS_ENDPOINT, data);
	//console.log("response: ", response.data.result);
	
	const blockData = {"jsonrpc":"2.0",
				  		"method":"eth_getBlockByNumber",
				  		"params":[block, false],
				  		"id":1 };

	//console.log("block data: ", blockData);
	const rpcBlock = await axios.post(RPC_AWS_ENDPOINT, blockData);
	console.log("block hash: ", rpcBlock.data.result.hash);
	let value = response.data.result.storageProof[0].value.slice(2).toString();
	console.log("value: ", value);
	//console.log("proof: ", response.data); //.result.storageProof[0]
	//console.log("storageProof: ", response.data.result.storageProof[0]);
	
 	
 	const getAndVerify = new GetAndVerify(RPC_AWS_ENDPOINT);
 	
    let blockHash       = rpcBlock.data.result.hash;
    let accountAddress  = SCOREAWS_ADDRESS;
    let position        = key;
    
    try {	 		 

    console.log("Verifying proof...");
    let storageValue = await getAndVerify.storageAgainstBlockNumber(accountAddress, position, block, blockHash);
    console.log("Value after verifying proof:", parseInt(storageValue.toString('hex')));
    //storageValue.equals(toBuffer("0x1234")).should.be.true()
    //storageValue.equals(toBuffer("0x9999")).should.be.false()

 	} catch (error) {
      console.error("catch", error);
    }


};



module.exports = {
	awsproof
}