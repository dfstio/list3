
const {RPC_GOERLI, RPC_MUMBAI, KEY_OWNER, LISTHASH_CONTRACT_ADDRESS, LIST_CONTRACT_ADDRESS } = require('@list/config');
const ListHashJSON = require("@list/contracts/abi/contracts/listhash.sol/ListHash.json");
const ListJSON = require("@list/contracts/abi/contracts/list.sol/List.json");
const ethers = require("ethers");
const {POSClient, use} = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
use(Web3ClientPlugin);


const wallet = new ethers.Wallet(KEY_OWNER);
const address = wallet.address;
const maticprovider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
const listhash = new ethers.Contract(LISTHASH_CONTRACT_ADDRESS, ListHashJSON, ethereumprovider);
const list = new ethers.Contract(LIST_CONTRACT_ADDRESS, ListJSON, maticprovider);




async function main()
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
    
    const events = await list.queryFilter('MessageSent');
    console.log("Found ", events.length, " events");
    
    let i = events.length - 1;
    while( i >= 0)
    {    
		 const txHash = events[i].transactionHash;
		 const isReady = await posClient.isCheckPointed(txHash);
		 console.log("Event ", i, " isCheckPointed: ", isReady);
		 if( isReady )
		 {
			 const proof = await posClient.exitUtil.buildPayloadForExit(txHash, "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036")
			 console.log("proof: ", proof);    
			 const result = await listhash.parseMessage(proof);
			 console.log("Result: ", result);
			 return;
		 } else i--; 
	};
};


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
