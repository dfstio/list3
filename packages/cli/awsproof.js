const {RPC_AWS_ENDPOINT, SCOREAWS_ADDRESS, KEY_OWNER, SCORE_ADDRESS,
		RPC_GOERLI, RPC_MUMBAI, BRIDGE_MUMBAI, BRIDGE_GOERLI, PROVER_MUMBAI, SCOREMUMBAI_ADDRESS } = require('@list/config');


const BridgeJSON = require("@list/contracts/abi/contracts/bridge.sol/Bridge.json");
const ProverJSON = require("@list/contracts/abi/contracts/prover.sol/MerkleProver.json");
const ScoreJSON = require("@list/contracts/abi/contracts/score.sol/Score.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const rlp = require('rlp');
const web3 = require('web3');

const axios = require('axios');
const GetAndVerify =  require('./getAndVerify.js')

const {POSClient, setProofApi, use} = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
use(Web3ClientPlugin);

function expandkey(hexvalue) {
    if (hexvalue.substring(0, 2) === '0x') hexvalue = hexvalue.substring(2);
    return [...new Array(hexvalue.length).keys()]
        .map(i => '0' + hexvalue[i])
        .join('')
}

function buffer2hex(buffer) {
    return '0x' + Buffer.from(buffer).toString('hex');;
}



async function prove(permalink, value, data, header, blockhash)
{
	//console.log("prove: ", data, header);
	//const storageAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';

	 const expectedValue = rlp.decode(data.accountProof[data.accountProof.length - 1])[1];
	 const ind = 0;
	 const kkkey = '0x' + data.storageProof[ind].key.substring(2).padStart(64, '0');
	 const contractKey = '0x' + expandkey(web3.utils.soliditySha3(data.address));
	 const storageKey = '0x' + expandkey(web3.utils.soliditySha3(kkkey));
	 const valueHex = ethers.utils.hexlify(BigInt(data.storageProof[ind].value));
	 
	 const accountProof = {
		 expectedRoot: header.stateRoot,
		 key: contractKey,
		 //key: '0x' + expandkey(ethers.utils.solidityKeccak256(['address'],[data.address])),
		 proof: data.accountProof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: buffer2hex(expectedValue)
	 }


	 const storageProof = {
		 expectedRoot: data.storageHash,
		 key: storageKey,
		 //key: '0x' + expandkey(ethers.utils.solidityKeccak256(['address'],[kkkey])),
		 proof: data.storageProof[ind].proof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: valueHex,
	 }
	 console.log("prove data: ", valueHex);
	 
	 const provider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	 const wallet = new ethers.Wallet(KEY_OWNER);

     const signer = wallet.connect(provider);
	 const bridge = new ethers.Contract(BRIDGE_GOERLI, BridgeJSON, provider);
	 const score = new ethers.Contract(SCORE_ADDRESS, ScoreJSON, signer);

	 const proof = { header: header, accountProof: accountProof, storageProof: storageProof };
	 
	 
	 const proofTypes = [ 
			"tuple(bytes32 hash,bytes32 parentHash,bytes32 sha3Uncles,address miner,bytes32 stateRoot,bytes32 transactionsRoot,bytes32 receiptsRoot,bytes logsBloom,uint256 difficulty,uint256 number,uint256 gasLimit,uint256 gasUsed,uint256 timestamp,bytes extraData,bytes32 mixHash,uint64 nonce,uint256 totalDifficulty) header",
		 	"tuple(bytes32 expectedRoot ,bytes key,bytes[] proof,uint256 keyIndex,uint256 proofIndex,bytes expectedValue) accountProof",
		 	"tuple(bytes32 expectedRoot ,bytes key,bytes[] proof,uint256 keyIndex,uint256 proofIndex,bytes expectedValue) storageProof"];

 
	 const abiCoder = ethers.utils.defaultAbiCoder;
	 const proofData = abiCoder.encode(proofTypes, [header, accountProof, storageProof] );
	 //console.log("proofData", proofData);
     let check = await bridge.verify(proofData, data.address, data.storageProof[0].key, valueHex, 24 * 60 );
     
     //let key = await bridge.getMapStorageKey(permalink, 0);
     //console.log("key", key, data.storageProof[0].key);
     console.log("verify on Goerli response: ", check);
     
     const tx = await score.syncScore(
			permalink,
			valueHex,
			proofData,
			data.address,
	 		24 * 60);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	console.log('Transaction block:', receipt.blockNumber);
				  
};


async function getBlock(rpc, contract, needCheckpointed = false)
{
	 const provider = new ethers.providers.JsonRpcProvider(rpc);
	 const bridge = new ethers.Contract(contract, BridgeJSON, provider);
	 
     const events = await bridge.queryFilter('Blockhash');

     console.log("Found ", events.length, "Blockhash events");
     
     if( needCheckpointed == false ) return { 	number: events[events.length - 1].args.blocknumber, 
     								timestamp: events[events.length - 1].args.blocktimestamp,
     								hash: events[events.length - 1].args.blockhash	};
     
     const posClient = new POSClient();
     const maticprovider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
	 const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	 const wallet = new ethers.Wallet(KEY_OWNER);
	 const address = wallet.address;
	 await posClient.init(
	 {
	  log: false,
      network: "testnet",
      version: "mumbai",
      parent: {
		  provider: new ethers.Wallet(KEY_OWNER, ethereumprovider),
		  defaultConfig: {
			from : address
		  }
	  },
	  child: {
		   provider: new ethers.Wallet(KEY_OWNER, maticprovider),
		   defaultConfig: {
			 from : address
		   }
	  }
    });
						
     let i = events.length - 1;
	 while( i >= 0)
	 {    
		  const txHash = events[i].transactionHash;
		  const isReady = await posClient.isCheckPointed(txHash);
		  console.log("Event ", i, " isCheckPointed: ", isReady);
		  if( isReady )
		  {
			  return { 	number: events[i].args.blocknumber, 
     					timestamp: events[i].args.blocktimestamp,
     					hash: events[i].args.blockhash	};
			  
			  break;		
		  } else i--; 
	 };

	return {number: 0, 
     		timestamp: 0,
     		hash: 0	};
}



async function awsproof(permalink)
{	

    console.log('Checking blockhash on Goerli... ');	
	const blockGoerli = await getBlock(RPC_GOERLI, BRIDGE_GOERLI); //(RPC_GOERLI, BRIDGE_GOERLI);
	console.log("Goerli block: ");
	let date = new Date(blockGoerli.timestamp*1000);
	console.log(JSON.stringify({number: parseInt(blockGoerli.number).toString(), 
								hash: blockGoerli.hash.toString(),
								timestamp: date.toUTCString() },
								(_, v) => typeof v === 'BigNumber' ? v.toString() : v,
								1));
	/*
	console.log('Checking blockhash on Mumbai... ');	
	const blockMumbai = await getBlock(RPC_MUMBAI, BRIDGE_MUMBAI, true);
	console.log("Mumbai block: ");
	date = new Date(blockMumbai.timestamp*1000);
	console.log(JSON.stringify({number: parseInt(blockMumbai.number).toString(), 
								hash: blockMumbai.hash.toString(),
								timestamp: date.toUTCString() },
								(_, v) => typeof v === 'BigNumber' ? v.toString() : v,
								1));

	*/
	let permalinkHex = BigInt(permalink).toString(16).padStart(64, '0');
	//console.log("ethproof: ", permalink, permalinkHex, permalinkHex.length);
	//while( permalinkHex.length < 64) permalinkHex = "0" + permalinkHex;
	
	// position of map versions is 0x00
	const key = "0x" + toHex(keccak256(hexToBytes(permalinkHex +
								 "0000000000000000000000000000000000000000000000000000000000000000"))).toString();
	const block = "0x" + parseInt(blockGoerli.number.toString()).toString(16);
   
	const data = {"jsonrpc":"2.0",
				  "method":"eth_getProof",
				  "params":[
						SCOREAWS_ADDRESS,
						[key],
						block],
				  "id":1 };
		  
	console.log("ethproof: ", data);

	const response = await axios.post(RPC_AWS_ENDPOINT, data);
	// console.log("response: ", response);
	
	
	const blockData = {"jsonrpc":"2.0",
				  		"method":"eth_getBlockByNumber",
				  		"params":[block, false],
				  		"id":1 };

	//console.log("block data: ", blockData);
	const rpcBlock = await axios.post(RPC_AWS_ENDPOINT, blockData);
	//console.log("block data: ", rpcBlock.data.result);
	
	
	let value = response.data.result.storageProof[0].value.toString();
	console.log("Value from AWS chain: ", value);
	//console.log("proof: ", response.data.result); //.result.storageProof[0]
	console.log("storageProof: ", response.data.result.storageProof[0]);
	
 	
 	const getAndVerify = new GetAndVerify(RPC_AWS_ENDPOINT);
 	
    let blockHash       = blockGoerli.hash;
    let accountAddress  = SCOREAWS_ADDRESS;
    let position        = key;
    
    try {	 		 

	   console.log("Verifying proof...");
	   let storageValue = await getAndVerify.storageAgainstBlockNumber(accountAddress, position, block, blockHash);
	   console.log("Value after verifying proof off-chain:", parseInt(storageValue.toString('hex')));

 	} catch (error) {
      console.error("catch", error);
    }

	console.log("Verifying proof on Goerli...");
	await prove(permalink, value, response.data.result, rpcBlock.data.result, blockGoerli.hash.toString());


};



module.exports = {
	awsproof
}