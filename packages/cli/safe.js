const { RELAY, BRIDGE_GOERLI, SAFE_GOERLI, RPC_GOERLI, RPC_SAFE } = require('@list/config');
const BridgeJSON = require("@list/contracts/abi/contracts/bridge.sol/Bridge.json");
const ethers = require("ethers");
const { SafeHelper } = require("gnosis-safe-helper");


async function safeSeal (rpc, bridgeAddress, block, safeAddress)
{
	const safe = new SafeHelper( "0x08904B6bD83A99BF95ecaF7dF76a83fB67C991fA", { RPC_GOERLI, RPC_SAFE });
	
	  // Structure a gnosis safe transaction (as delegate)
	 const bridge = new ethers.utils.Interface(BridgeJSON);
     const data = bridge.encodeFunctionData("seal", [block.number, block.timestamp, block.hash]); 
	 const transaction = {
	   to: BRIDGE_GOERLI,
	   value: 0,
	   data: data,
	 };
	 	 
	 const safeTx = await safe.createTransaction( transaction, RELAY[1]);
	 // Propose the transaction
	 const safeTxHash = await safe.proposeTransaction( { safeTx, origin: "List cli" }, RELAY[1]);
	   
	 // Give 1st approval (as primary signer)
  	 const firstApproval = await safe.approveTransaction( safeTxHash, RELAY[2] );
  	 await firstApproval.transactionResponse?.wait();
  	 
  	 // Give 2nd approval (as secondary signer)
  	 const secondApproval = await safe.approveTransaction(safeTxHash, RELAY[3]);
  	 await secondApproval.transactionResponse?.wait();

	  // Execute the fully signed transaction (as delegate)
	  const execution = await safe.executeTransaction(safeTxHash, RELAY[1]);
	  await execution.transactionResponse?.wait();
	  
}



module.exports = {
	safeSeal
}

