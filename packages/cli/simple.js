
const {RPC_L3_ENDPOINTS, RPC_L3_LOAD, RPC_L3_PASSWORD, RPC_L3_USER, RELAY, LOAD_L3 } = require('@list/config');
const LoadJSON = require("@list/contracts/abi/contracts/load.sol/Load.json");

const crypto = require('crypto');
const ethers = require("ethers");
const axios = require('axios');

const heavy = true;

async function main()
{
	let value = 1;
	let errorCount = 0;
	const count = 10000000;
	let batch = 50;
	

    
	const wallet = ethers.Wallet.createRandom(); //new ethers.Wallet(RELAY[relayId]);
	const address = wallet.address;
	const rpcId = 3; //crypto.randomInt(1, 4);
	const rpc =  {url: RPC_L3_ENDPOINTS[rpcId],  user: RPC_L3_USER, password: RPC_L3_PASSWORD};
	console.log("load1 rpc: ", RPC_L3_ENDPOINTS[rpcId]);
	const provider = new ethers.providers.JsonRpcProvider(rpc); //JsonRpcUncheckedSigner JsonRpcBatchProvider
	//const provider1 = provider.getUncheckedSigner();
	const signer = wallet.connect(provider);
	//const signer = signer1.connectUnchecked();
	//const Score = new ethers.Contract(SCOREAWS_ADDRESS, ScoreJSON, signer);
	let i = 0;
	//let prevTime = Date.now();
	
	const startTime = Date.now();
	let block = await provider.getBlock("latest");
	let blockNum = block.number; 
	let transactions = 0;
	let nonce = 0;
	
	let data;
	// ZK proof
	if( heavy )
	{
		
		 //await load(1, i, errorCount, startTime, provider, address, transactions);
		 const proof = require("../../proof/proof.json");			
		 const publicSignals = require("../../proof/public.json");	
		 const permalink = 77;
		 
		 /*	
		 const loadContract = new ethers.Contract(LOAD_L3, LoadJSON, signer);
		 
		 const tx = await loadContract.verify(permalink,
				   [proof.pi_a[0], proof.pi_a[1]],
				   [[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
				   [proof.pi_c[0],proof.pi_c[1]],
				   publicSignals); //result.publicSignals
		 console.log("TX sent: ", tx.hash);
		 const receipt = await tx.wait(2);
		 console.log('Transaction gas used:', receipt.gasUsed.toString(), 
				   "gas price:", (receipt.effectiveGasPrice/1000000000).toString());
		 // Transaction gas used: 268436 gas price: 1.500000007
		 console.log('Transaction block:', receipt.blockNumber);
	 	 */
	 	 
		 const loadInterface = new ethers.utils.Interface(LoadJSON);
		 data = loadInterface.encodeFunctionData("verify", [permalink,
				   [proof.pi_a[0], proof.pi_a[1]],
				   [[proof.pi_b[0][1],proof.pi_b[0][0]],[proof.pi_b[1][1],proof.pi_b[1][0]]],
				   [proof.pi_c[0],proof.pi_c[1]],
				   publicSignals]);
	};
	
	
	while( i < count ) 
	{ 
		try {
			 if( i%10 === 0) await load(1, i, errorCount, startTime, provider, address, transactions);
			 

			 for (let k = 1; k < 2; k++)
			 {
			 	   let reqs = []
				   for (let j = 0; j < batch; j++)
				   {
				   		let tx;
				   		if( heavy )
				   		{
						    tx = await signer.signTransaction({
											  to: LOAD_L3,
											  from: address,
											  data: data,
											  value: 0,
											  chainId: 7877,
											  nonce: nonce, //batch * i + j,
											  gasLimit: 300000,
											  gasPrice: 1600000000
									  });
				   		
				   		}
				   		else
				   		{
						     tx = await signer.signTransaction({
											  to: address,
											  from: address,
											  value: 0,
											  chainId: 7877,
											  nonce: nonce, //batch * i + j,
											  gasLimit: 21000,
											  gasPrice: 1600000000
										  });
						 };
						 nonce++;
						 if( j == 0 && i == 0) console.log("tx length:", tx.toString().length);
						 reqs.push({"jsonrpc":"2.0",
											 "method":"eth_sendRawTransaction",
											 "params":[tx],
											 "id": j }); 
				 
				  };
				  transactions = transactions + batch;
				  
				  // check txpool status
				  const dataTxPool = {"jsonrpc":"2.0",
								"method":"txpool_status",
								"params":[],
								"id":1 };

				 let waitPending = true;
				 let oldPending = 0;
				 while( waitPending )
				 {
		 
					   const responseTxPool = await axios.post(RPC_L3_LOAD[rpcId], dataTxPool);  //k
					   const pending = responseTxPool.data.result.pending;
					   if( pending > 512 )
					   {
					   		if( oldPending !== pending)
					   		{
								console.log("txpool status:");
								console.log("    pending:", parseInt(responseTxPool.data.result.pending.toString()));
								console.log("    queued: ", parseInt(responseTxPool.data.result.queued.toString()));
								oldPending = pending;
							};
							await sleep(5000)
					   } else waitPending = false;
			 	 };

				  const response = await axios.post(RPC_L3_LOAD[rpcId], reqs); //k
			 };
			 if( batch < 56) batch++;
			 
			 let waitBlock = true;
			 while( waitBlock )
			 {
			 	 block = await provider.getBlock("latest");	  
			 	 if( block.number > blockNum)
			 	 {
			 	 	waitBlock = false;
			 	 	blockNum = block.number ;
			 	 	
			 	 }
			 	 if( waitBlock) await sleep(500);
			 };
			 i++; 
			 console.log("Batch", i, "size", batch, "block", blockNum);
		} catch (error) {
      		console.error("catch", error.toString().substr(0,500));
      		errorCount++;
      	
        }

	}
}	

async function load( id, i, errorCount, startTime, provider, address, transactions)
{
	if( i%10 === 0)
	{
		const nowTime = Date.now();
		//transaction rate per hour
		const rate = transactions * 1000 /(nowTime-startTime);
		const errorRate = errorCount * 1000 * 60 * 60 /(nowTime-startTime);
		console.log("Load", id, address, ": transaction rate is", rate.toFixed(0),
			"per second, error rate is", errorRate.toFixed(0), "per hour, executed", i, "times");
		
		let needTopUp = true;
		while( needTopUp)
		{
			 try {

				const balance = await provider.getBalance(address);
				if( balance < 5000000000000000000)
				{
					console.log("Balance of", id, address, "is", balance/1000000000000000000);
					const relayId = crypto.randomInt(1, 7);
					const wallet = new ethers.Wallet(RELAY[relayId]);
					const signer = wallet.connect(provider);
					// Send 1 ether
					const tx = await signer.sendTransaction({
								  to: address,
								  value: ethers.utils.parseEther("100.0")
							  });
					console.log("TX sent: ", tx.hash, "to topup", address);
					const receipt = await tx.wait(2);
					const balanceNew = await provider.getBalance(address);
					console.log("New balance of", id, address, "is", balanceNew/1000000000000000000);
					if( balanceNew >= 5000000000000000000) needTopUp = false;
				} else needTopUp = false;
		
			 
			} catch (error) {
				 console.error("catch topup", id, address, error.toString().substr(0,500));
				 errorCount++;
				 const delay = crypto.randomInt(10000, 120000);
				 await sleep(delay);      	
        	}
		}
	
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
