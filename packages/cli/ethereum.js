const {RPC_GOERLI, RPC_MUMBAI, KEY_OWNER, LISTHASH_CONTRACT_ADDRESS, LIST_CONTRACT_ADDRESS } = require('@list/config');
const ListHashJSON = require("@list/contracts/abi/contracts/listhash.sol/ListHash.json");
const ListJSON = require("@list/contracts/abi/contracts/list.sol/List.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const axios = require('axios');
const {POSClient, setProofApi, use} = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
use(Web3ClientPlugin);


const wallet = new ethers.Wallet(KEY_OWNER);
const address = wallet.address;
const maticprovider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
const listhash = new ethers.Contract(LISTHASH_CONTRACT_ADDRESS, ListHashJSON, ethereumprovider);
const list = new ethers.Contract(LIST_CONTRACT_ADDRESS, ListJSON, maticprovider);



async function checkEthereum()
{
	 
	 const posClient = new POSClient();
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
    
    let events = await list.queryFilter('Version');
    console.log("Found ", events.length, "Version events");
    
    let i = events.length - 1;
    while( i >= 0)
    {    
		 const txHash = events[i].transactionHash;
		 const isReady = await posClient.isCheckPointed(txHash);
		 console.log("Event ", i, " isCheckPointed: ", isReady);
		 if( isReady )
		 {
			 const proof = await posClient.exitUtil.buildPayloadForExit(txHash, "0x40779ce7063d5f55ba195a4101faa644098b5c4e985b7d57f5f326e4f6e2af84")
			 console.log("proof: ", proof);    
			 const result = await listhash.getVersion(proof);
			 console.log("Result: ");
			 console.log(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
			 break;		
		 } else i--; 
	};
	
    events = await list.queryFilter('Roothash');
    console.log("Found ", events.length, " Roothash events");
    
    i = events.length - 1;
    while( i >= 0)
    {    
		 const txHash = events[i].transactionHash;
		 const isReady = await posClient.isCheckPointed(txHash);
		 console.log("Event ", i, " isCheckPointed: ", isReady);
		 if( isReady )
		 {
			 const proof = await posClient.exitUtil.buildPayloadForExit(txHash, "0xf467dc3352c24e3163f55b7f0140fcc06603b14efe5ea1997d0b32da739f4101")
			 console.log("proof: ", proof);    
			 const result = await listhash.getRoothash(proof);
			 console.log("Result: ");
			 console.log(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v, 1));
			 return;
		 } else i--; 
	};

};

async function getProof(relayId)
{
	 let proof = 0;
	 await setProofApi("https://apis.matic.network/");
	 const posClient = new POSClient();
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
    
    let events = await list.queryFilter('Version');
    console.log("Found ", events.length, "Version events");
    
    let i = events.length - 1;
    while( i >= 0)
    {    
		 const txHash = events[i].transactionHash;
		 const isReady = await posClient.isCheckPointed(txHash);
		 console.log("Event ", i, " isCheckPointed: ", isReady, "relayId", events[i].args.relayId.toString());
		 if( isReady && (events[i].args.relayId == relayId))
		 {
			 proof = await posClient.exitUtil.buildPayloadForExit(txHash, "0x40779ce7063d5f55ba195a4101faa644098b5c4e985b7d57f5f326e4f6e2af84")
			 console.log("proof: ", proof);    
			 break;		
		 } else i--; 
	};
	
	return proof;
};


async function proofAPI(txHash, signature)
{
  const data = {"txHash": txHash, "signature": signature }; 
  const url = `https://apis.matic.network/api/v1/mumbai/exit-payload/${txHash.toString()}?eventSignature=${signature.toString()}`;
  console.log("proof api: ", data, url);
  const response = await axios.get(url);
  return response;
};

async function getSeal(permalink)
{
	 let proof = 0;
	 await setProofApi("https://apis.matic.network/");

	 const posClient = new POSClient();
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
    
    const SEAL_EVENT_SIG = "0xa3a00acaf8b829065e0770f39bf5ac70dd76bec281c2ec75f3789ca4ae9500ca";
    let events = await list.queryFilter('Seal');
    console.log("Found ", events.length, "Seal events");
    
    let i = events.length - 1;
    while( i >= 0)
    {    
		 const txHash = events[i].transactionHash;
		 const isReady = await posClient.isCheckPointed(txHash);
		 console.log("Event ", i, " isCheckPointed: ", isReady, "permalink", events[i].args.permalink.toString());
		 if( isReady && (events[i].args.permalink == permalink))
		 {
		 	 const start1 = Date.now();
			 const proof1 = await proofAPI(txHash, SEAL_EVENT_SIG);
			 const end1 = Date.now();
			 proof = proof1.data.result;
			 console.log("proof from api: ");
			 console.log(proof);
			 

//		 	 const start2 = Date.now();
//			 proof = await posClient.exitUtil.buildPayloadForExit(txHash, SEAL_EVENT_SIG);
//			 const end2 = Date.now();
//			 console.log("proof from posClient:");
//			 console.log( proof );    
			 console.log("Time api", (end1-start1)/1000, "sec");
//			 console.log("Time posClient", (end2-start2)/1000);
//			 if( proof1.data.result.toString() == proof) console.log("Proofs are the same");
//			 else console.log("Proofs are different");
			 break;		
		 } else i--; 
	};

	return proof;
};

async function ethproof(permalink, validity)
{	
	
	let permalinkHex = BigInt(permalink).toString(16);
	//console.log("ethproof: ", permalink, permalinkHex, permalinkHex.length);
	while( permalinkHex.length < 64) permalinkHex = "0" + permalinkHex;
	
	// position of map versions is 0x97
	const key = "0x" + toHex(keccak256(hexToBytes(permalinkHex +
								 "0000000000000000000000000000000000000000000000000000000000000097"))).toString();
   
	const data = {"jsonrpc":"2.0",
				  "method":"eth_getProof",
				  "params":[
						LIST_CONTRACT_ADDRESS,
						[key],
						"latest"],
				  "id":1 };
		  
	//console.log("ethproof: ", data, key);
	const response = await axios.post(RPC_MUMBAI, data);
	let value = response.data.result.storageProof[0].value.slice(2).toString();
	console.log("value: ", value);
	while( value.length < 64) value = "0" + value;
	const version = { relayId: "0x" + value.slice(0,32), version: "0x" + value.slice(32)}
	console.log("version: ", version);
	console.log("proof: ", response.data); //.result.storageProof[0]
	console.log("storageProof: ", response.data.result.storageProof[0]);
	return;
};

module.exports = {
	checkEthereum,
	getProof,
	getSeal,
	ethproof
}

