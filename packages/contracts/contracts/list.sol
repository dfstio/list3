pragma solidity 0.8.9;
//SPDX-License-Identifier: MIT
// Version 1.00


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";


contract List is Initializable, 
					OwnableUpgradeable, 
						PausableUpgradeable, 
							ERC2771ContextUpgradeable(0x4d4581c01A457925410cd3877d17b2fd4553b2C5)
{

	 struct Record {
			uint256 permalink;
			uint64 version;
			bool isRevoked; 
			string ipfsHash; // additional information, if any 
		}
		
	 // Sync roothash to Ethereum mainnet
	  uint256 public roothash; // roothash of SMT tree
	  uint256 public syncCounter; // number of leafs in SMT tree
	  uint public blockNumber;	  // block number when roothash was updated		
	  event MessageSent(bytes message); // send message to Ethereum mainnet


	  // Address properties
	  mapping(uint256 => uint256) public versions; // permalink => last Record 
	  Record[] public records;  
	 

	  // Events
	  event Version(uint256 permalink, uint64  version, string hash);
	  event Revoke(uint256 permalink, string hash);
	  event Sync(uint256 roothash, uint256 syncCounter, uint blockNumber);
	  event ModeratorChanged(address _address, bool status);

	  // Moderator accounts
	  mapping(address => bool) public moderator;
	  address[] private _moderators_list;

     

	  function initialize() public initializer {
		   __Ownable_init();
		   __Pausable_init();
		   records.push();
	   }
	   
	   function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable)
		   returns (address sender) {
		   return ERC2771ContextUpgradeable._msgSender();
	   }

	   function _msgData() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable)
		   returns (bytes calldata) {
		   return ERC2771ContextUpgradeable._msgData();
	   }

	   modifier onlyModerator() 
	   {
		   _isModerator();
		   _;
	   }

	   function _isModerator() internal view 
	   {
		   require((moderator[_msgSender()] == true) , "LIST01: not a moderator"); 
	   }
  
  
   
	   function getListVersion() public pure
		   returns (uint256)
	   {
			   return 210; // 210 = version 2.10
	   }
   

		function setModerator(address to, bool status)
			 external onlyOwner
		{
			 if( status == true &&  moderator[to] == false)
			 {
				   _moderators_list.push();
				   uint newModerator = _moderators_list.length - 1;
				   _moderators_list[newModerator] = to ;
			 }
			 moderator[to] = status; 
			 emit ModeratorChanged(to, status);
		}
  
		function getModerator(uint id)
			 external view returns (address)
		{
			 if( id < _moderators_list.length ) 
				   return _moderators_list[id];
			  else return address(0);
		}
  
		function getModeratorsCount()
			 external view returns (uint)
		{
			 return _moderators_list.length;
		}
  
 
  
		 function add(uint256 permalink, uint64 version, string memory ipfsHash)
			 external whenNotPaused onlyModerator
		 { 

			  uint256 index = versions[permalink];
			  require(records[index].isRevoked == false, "LIST02: permalink is already revoked"); 
			  require((version - records[index].version) == 1, "LIST03: version increment must be 1"); 

			  records.push();
			  uint256 counter = records.length - 1;
			  records[counter].permalink = permalink ;
			  records[counter].version = version ;
			  records[counter].ipfsHash = ipfsHash ;
		  
			  versions[permalink] = counter; 

			  emit Version(permalink, version, ipfsHash);
		 }
  
		 function revoke(uint256 permalink, string memory ipfsHash)
			 external whenNotPaused onlyModerator
		 { 
			  records.push();
			  uint256 counter = records.length - 1;
			  records[counter].permalink = permalink ;
			  records[counter].isRevoked = true ;
			  records[counter].ipfsHash = ipfsHash ;
		  
			  versions[permalink] = counter; 

			  emit Revoke(permalink, ipfsHash);
		 }

  
		 function getVersion(uint256 permalink)
			  external view returns (uint64)
		 {
			  return records[versions[permalink]].version;			  
		 }
		 
		 function isRevoked(uint256 permalink)
			  external view returns (bool)
		 {
			  return records[versions[permalink]].isRevoked;			  
		 }

		   
		 function getHash( uint256 permalink)
			  external view returns (string memory)
		 {
			return records[versions[permalink]].ipfsHash;			  
		 }


		 function getRecordsCount()
			  external view returns (uint256)
		 {
			  return records.length;
		 }
	

		 function pause()
			  external whenNotPaused onlyOwner
		 {
			  _pause(); 
		 }

		 function unpause()
			  external whenPaused onlyOwner
		  {
			  _unpause(); 
		  }
		 
		 function sync(	 uint256 _roothash, uint256 _syncCounter )
			  external whenNotPaused onlyOwner
		 {
		 	  require(_syncCounter > syncCounter, "LIST04: syncCounter is low"); 
			  roothash = _roothash;
			  syncCounter = _syncCounter ; //
			  blockNumber = block.number;
			  emit MessageSent(abi.encode(roothash, syncCounter, blockNumber));
			  emit Sync(roothash, syncCounter, blockNumber );			 
		 }
		 
  
}
