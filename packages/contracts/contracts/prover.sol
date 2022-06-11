pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: MIT
// Version 3.00

import "./lib/EthereumDecoder.sol";
import "./lib/MPT.sol";


contract MerkleProver
{
	using MPT for MPT.MerkleProof;
	
	function check(MPT.MerkleProof memory proof) public pure returns (bool valid)
	{
		valid = proof.verifyTrieProof();
		return valid;
	}	

	
	function verify(  EthereumDecoder.BlockHeader memory header,
					  MPT.MerkleProof memory accountProof,
        			  MPT.MerkleProof memory storageProof,
        			  bytes32 confirmedBlockHash) 
        	public pure returns (bool valid, string memory reason)
	{
		bytes32 blockHash = keccak256(getBlockRlpData(header));
        if (blockHash != header.hash) return (false, "Header data or hash invalid");

        // Check block hash is confirmed
        if (confirmedBlockHash != header.hash) return (false, "Unconfirmed block hash");
		
		// verify account
	    if (header.stateRoot != accountProof.expectedRoot) return (false, "verifyAccount - different trie roots");
        valid = accountProof.verifyTrieProof();
        if (!valid) return (false, "verifyAccount - invalid proof");
        
        // verify storage
        EthereumDecoder.Account memory account = EthereumDecoder.toAccount(accountProof.expectedValue);
        if (account.storageRoot != storageProof.expectedRoot) return (false, "verifyStorage - different trie roots");
		valid = storageProof.verifyTrieProof();
		if (!valid) return (false, "verifyStorage - invalid proof");
		return (true, "");
	}

    function getBlockRlpData(EthereumDecoder.BlockHeader memory header) internal pure returns (bytes memory data) {
        return EthereumDecoder.getBlockRlpData(header);
    }

}

