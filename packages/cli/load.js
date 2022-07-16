const { RELAY } = require('@list/config');
const ethers = require("ethers");
const crypto = require('crypto');

async function load( id, i, errorCount, startTime, provider, address)
{
	if( i%100 === 0)
	{
		const nowTime = Date.now();
		//transaction rate per hour
		const rate = i * 1000 * 60 * 60 /(nowTime-startTime);
		const errorRate = errorCount * 1000 * 60 * 60 /(nowTime-startTime);
		console.log("Load", id, address, ": transaction rate is", rate,
			"per hour, error rate is", errorRate, "per hour, executed", i, "times");
		
		let needTopUp = true;
		while( needTopUp)
		{
			 try {

				const balance = await provider.getBalance(address);
				if( balance < 500000000000000000)
				{
					console.log("Balance of", id, address, "is", balance/1000000000000000000);
					const relayId = crypto.randomInt(1, 7);
					const wallet = new ethers.Wallet(RELAY[relayId]);
					const signer = wallet.connect(provider);
					// Send 1 ether
					const tx = await signer.sendTransaction({
								  to: address,
								  value: ethers.utils.parseEther("1.0")
							  });
					console.log("TX sent: ", tx.hash, "to topup", address);
					const receipt = await tx.wait(2);
					const balanceNew = await provider.getBalance(address);
					console.log("New balance of", id, address, "is", balanceNew/1000000000000000000);
					if( balanceNew >= 500000000000000000) needTopUp = false;
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

function loadBridge( i, errorCount, startTime)
{
	if( i%100 === 0)
	{
		const nowTime = Date.now();
		//transaction rate per hour
		const rate = i * 1000 * 60 * 60 /(nowTime-startTime);
		const errorRate = errorCount * 1000 * 60 * 60 /(nowTime-startTime);
		console.log("Load bridge: transaction rate is", rate,
			"per hour, error rate is", errorRate, "per hour, executed", i, "times");
	};
		
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = {
	load,
	loadBridge
}
