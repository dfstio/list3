const {RPC_L3_ENDPOINT, RPC_L3_PASSWORD, RPC_L3_USER, RPC_MAINNET } = require('@list/config');
const RPC_L3 =  {url: RPC_L3_ENDPOINT,  user: RPC_L3_USER, password: RPC_L3_PASSWORD};
const RPC_L3_AXIOS = "https://" + RPC_L3_USER + ":" + RPC_L3_PASSWORD + "@" + RPC_L3_ENDPOINT.replace("https://", "");

const ethers = require("ethers");
const axios = require('axios');


function formatWinstonTime( ms )
{
    if( ms === undefined ) return "";
    if( ms < 1000) return ms + " ms";
    if ( ms < 60 * 1000) return parseInt(ms/1000) + " sec";
    if ( ms < 60 * 60 * 1000) return parseInt(ms/1000/60) + " min";
    return parseInt(ms/1000/60/60) + " h";
};

async function L3()
{	
/*
	try {
		const mainnetprovider = new ethers.providers.JsonRpcProvider(RPC_MAINNET);
		const balanceMain = await mainnetprovider.getBalance("0x8dDD641d70867342394c35e0a38CD6fE8200870E");
		const blockMain = await mainnetprovider.getBlock("latest");
		const startTimeMain =  Date.now();
		const delay_ms_main = startTimeMain - blockMain.timestamp*1000;
		const delayMain = formatWinstonTime(delay_ms_main);
		let dateMain = new Date(blockMain.timestamp*1000);
		console.log("Mainnet Block:", blockMain.number, "minted", delayMain, "ago at", dateMain.toUTCString());
		console.log("Mainnet balance is", balanceMain/1000000000000000000);
	} catch (error) {
			console.error("Mainnet PRC is down", error.toString().substr(0,500));

	}

	
*/


	const provider = new ethers.providers.JsonRpcProvider(RPC_L3);
	const balance = await provider.getBalance("0x1871c9CC2a3A5eB2108f567d87e60131E0EfD32f");
	console.log("Balance is", balance/1000000000000000000);
	
	const block = await provider.getBlock("latest"); //"latest"


    let date = new Date(block.timestamp*1000);
	const startTime =  Date.now();
	const delay_ms = startTime - block.timestamp*1000;
	const delay = formatWinstonTime(delay_ms);
	
	//console.log("Block:", block);
	console.log("Block:", block.number, "minted", delay, "ago at", date.toUTCString());
	if( delay_ms > 10 * 60 * 1000) console.log("Blockchain is not producing blocks, last block is", 
		block.number, "minted", delay, "ago at", date.toUTCString());
	
	// txpool status
	const dataTxPool = {"jsonrpc":"2.0",
				  "method":"txpool_status",
				  "params":[],
				  "id":1 };
		  
	const responseTxPool = await axios.post(RPC_L3_AXIOS, dataTxPool);
	console.log("txpool status:");
	console.log("    pending:", parseInt(responseTxPool.data.result.pending.toString()));
	console.log("    queued: ", parseInt(responseTxPool.data.result.queued.toString()));

	//clique status
	const data = {"jsonrpc":"2.0",
				  "method":"clique_status",
				  "params":[],
				  "id":1 };
		  
	const response = await axios.post(RPC_L3_AXIOS, data);
	console.log("clique status:", response.data.result);
	if( response.data.result.inturnPercent !== 100) console.log("Clique inturn percent is low: ",
		response.data.result.inturnPercent, "%" );
		
    const startTimeBlock =  block.timestamp;
    let lastBlockTime = block.timestamp;
    let blockNum = block.number; 	
    let transactions = 0;
	let blocks = 0;	
	
	while(true) 
	{
		let waitBlock = true;
		while( waitBlock )
		{
			const blockNow = await provider.getBlock("latest");	  
			if( blockNow.number > blockNum)
			{
			   waitBlock = false;
			   for( let bn = blockNum + 1; bn <= blockNow.number; bn++ )
			   {
				   const block1 = await provider.getBlockWithTransactions(bn);
				   transactions = block1.transactions.length + transactions;
				   blocks++;
				   		const nowTime = Date.now();

				   console.log("block", block1.number, 
				   			   "mined by", "node" + block1.extraData.toString().slice(3,4),
				   			    "for", block1.timestamp -lastBlockTime, "sec",
				   				"transactions:", block1.transactions.length,
				   				"block rate (t/s):", (block1.transactions.length/5).toFixed(1),
				   				"total rate (t/s):", (transactions /(block1.timestamp-startTimeBlock)).toFixed(1));
				   			
				   	lastBlockTime = block1.timestamp;
				   
			   }
			   blockNum = blockNow.number ;
			   
			}
			if( waitBlock) await sleep(1000);
		};
	}

		
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	L3
}