pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: MIT
// Version 3.30

import "./lib/EthereumDecoder.sol";
import "./lib/MPT.sol";

        
contract Bridge
{
		using MPT for MPT.MerkleProof;
		
		address public owner;
		mapping(bytes32 => uint256) timestamp; // block hash => block timestamp
		uint256 public lastBlockNumber; // last written block number
		
		event Blockhash(uint256 blocknumber, uint256 blocktimestamp, bytes32 blockhash);
		event Owner(address newOwner);
		
		constructor(address _owner) {
        	owner = _owner;
   		}
		
		modifier onlyOwner() 
		{
			_isOwner();
			_;
		}

		function _isOwner() internal view 
		{
			require(owner == msg.sender , "BRIDGE01: not a owner"); 
		}  
   
		function transfer(address newOwner)
			 external onlyOwner
		{
			owner = newOwner;
			emit Owner( newOwner );
		}


		function seal(uint256 _blocknumber, uint256 _blocktimestamp, bytes32 _blockhash) 
			external onlyOwner
		{ 
			 require( _blocknumber  > lastBlockNumber , "BRIDGE02: block is old"); 	
			 require( timestamp[_blockhash] == 0 , "BRIDGE03: block is already registered"); 	
			 lastBlockNumber = _blocknumber;
			 timestamp[_blockhash] = _blocktimestamp;
			 emit Blockhash(_blocknumber, _blocktimestamp, _blockhash); 
		}
		
		function verify(  bytes calldata proofData,
						  address contractAddress,
						  bytes calldata storageKey,
						  bytes calldata value,
						  uint256 blockhashExpiryMinutes) 
				external view returns (bool valid, string memory reason)
		{
			(EthereumDecoder.BlockHeader memory header, 
				MPT.MerkleProof memory accountProof, 
				MPT.MerkleProof memory storageProof) = 
					abi.decode(proofData, (EthereumDecoder.BlockHeader, MPT.MerkleProof, MPT.MerkleProof));
							
			// verify blockhash
			if (timestamp[header.hash] == 0) return (false, "Unregistered block hash");
			
			//verify proof
			if (keccak256(expand(abi.encodePacked(keccak256(storageKey)))) != keccak256(storageProof.key)) 
				return (false, "verifyStorage - different keys");

			if (keccak256(value) != keccak256(storageProof.expectedValue)) 
				return (false, "verifyStorage - different values");
			if (keccak256(expand(getContractKey(contractAddress))) != keccak256(accountProof.key)) 
				return (false, "verifyAccount - different keys");
			
			// verify header
			bytes32 blockHash = keccak256(getBlockRlpData(header));
			if (blockHash != header.hash) return (false, "Header data or hash invalid");
			
			// verify blockhash
			if (blockHash != header.hash) return (false, "Wrong blockhash");
		    if( block.timestamp > (timestamp[blockHash] + blockhashExpiryMinutes * 1 minutes))
		    	return (false, "block hash is expired");

			// verify account
			if (header.stateRoot != accountProof.expectedRoot) return (false, "verifyAccount - different trie roots");
			if (false == accountProof.verifyTrieProof()) return (false, "verifyAccount - invalid account proof");
		
			// verify storage
			EthereumDecoder.Account memory account = EthereumDecoder.toAccount(accountProof.expectedValue);
			if (account.storageRoot != storageProof.expectedRoot) return (false, "verifyStorage - different trie roots");
			if (false == storageProof.verifyTrieProof()) return (false, "verifyStorage - invalid storage proof");
			
			return (true, "");



		}

		function verifyHash( bytes calldata proofData,
							 address contractAddress,
							 bytes calldata storageKey,
							 bytes calldata value,
							 uint256 blockhashExpiryMinutes,
							 bytes32 _blockhash,
							 uint256 _timestamp) 
				external view returns (bool valid, string memory reason)
		{
			(EthereumDecoder.BlockHeader memory header, 
				MPT.MerkleProof memory accountProof, 
				MPT.MerkleProof memory storageProof) = 
					abi.decode(proofData, (EthereumDecoder.BlockHeader, MPT.MerkleProof, MPT.MerkleProof));
				
			 //verify proof
			if (keccak256(expand(abi.encodePacked(keccak256(storageKey)))) != keccak256(storageProof.key)) 
				return (false, "verifyStorage - different keys");

			if (keccak256(value) != keccak256(storageProof.expectedValue)) 
				return (false, "verifyStorage - different values");
			if (keccak256(expand(getContractKey(contractAddress))) != keccak256(accountProof.key)) 
				return (false, "verifyAccount - different keys");
			
			// verify header
			bytes32 blockHash = keccak256(getBlockRlpData(header));
			if (blockHash != header.hash) return (false, "Header data or hash invalid");
			
			// verify blockhash
			if (blockHash != _blockhash) return (false, "Wrong blockhash");
		    if( block.timestamp > (_timestamp + blockhashExpiryMinutes * 1 minutes))
		    	return (false, "block hash is expired");

			// verify account
			if (header.stateRoot != accountProof.expectedRoot) return (false, "verifyAccount - different trie roots");
			if (false == accountProof.verifyTrieProof()) return (false, "verifyAccount - invalid account proof");
		
			// verify storage
			EthereumDecoder.Account memory account = EthereumDecoder.toAccount(accountProof.expectedValue);
			if (account.storageRoot != storageProof.expectedRoot) return (false, "verifyStorage - different trie roots");
			if (false == storageProof.verifyTrieProof()) return (false, "verifyStorage - invalid storage proof");
			
			return (true, "");

		}


		function getMapStorageKey(uint256 index, uint256 mapPosition) external pure returns (bytes memory data) 
		{
			return abi.encodePacked(keccak256(abi.encodePacked(index, mapPosition)));
		}


		function getBlockRlpData(EthereumDecoder.BlockHeader memory header) internal pure returns (bytes memory data) 
		{
			return EthereumDecoder.getBlockRlpData(header);
		}
		
		function getContractKey(address contractAddress) internal pure returns (bytes memory data) 
		{
			return abi.encodePacked(keccak256(abi.encodePacked(contractAddress)));
		}

		function expand(bytes memory input) internal pure returns (bytes memory expandedData) 
		{		

		    bytes memory data = new bytes(input.length * 2);
		    uint k;		
			for (uint i = 0; i < input.length; i++)
        	{
        		bytes1 a = input[i] >> 4;
        		bytes1 b = input[i] & hex"0F";
        		data[k] = a; k++;
        		data[k] = b; k++;
        	}

			return data;
		}

}
