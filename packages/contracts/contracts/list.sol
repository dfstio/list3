pragma solidity 0.8.9;
//SPDX-License-Identifier: MIT
// Version 3.00


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


contract List is Initializable, OwnableUpgradeable, PausableUpgradeable
{
		// Version of the permalink object served by relay
		struct ObjectVersion {
			   uint128 version; // 0 - 1st version, 1 - revoked, >1 - version number
			   uint128 relayId; // relayId of SMT tree relay responsible for permalink
		   }
		
		mapping(uint256 => ObjectVersion) versions; // permalink => Version
	 
		// Relays maintaining Sparse Merkle Trees ("SMT")
		struct Relay {
			   address relayAddress;
			  // Sync roothash data to Ethereum mainnet
			   uint256 roothash; 	// roothash of the SMT
			   uint256 counter; 	// number of updates in SMT
			   uint256 timestamp; 	// timestamp of roothash update
		}	
	 
		Relay[] public relays; // relays numbering starts from 1, relay[0] is empty
		uint128 public relaysCount; 
		mapping(address => uint128) public relaysIndex; // relayAddress => index in relays[]
	   
		// allowed transfers between relays
		// relayId => permalink => roothash
		mapping (uint128 => mapping(uint256 => uint256)) public allowedTransfers; 

		// Events
		event Version(uint256 indexed permalink, uint128 indexed version, uint128 indexed relayId); // new version recorded
		event Roothash(uint256 indexed roothash, uint256 timestamp, uint128 indexed relayId); // Relay's roothash changed
		event RelayAdded(address indexed relayAddress, uint128 indexed relayId); // Added new relay


		function initialize() public initializer {
			 __Ownable_init();
			 __Pausable_init();
			 relays.push();
		 }
	   
		 modifier onlyRelay() 
		 {
			 _isRelay();
			 _;
		 }

		 function _isRelay() internal view 
		 {
			 require((relaysIndex[msg.sender] > 0) , "LIST01: not a relay"); 
		 }  
   
		 function getContractVersion() public pure
			 returns (uint64)
		 {
				 return 300; // 300 = version 3.00
		 }
   
		 function addRelay(address to)
			  external onlyOwner
		 {
			  require((relaysIndex[to] == 0) , "LIST02: relay already added"); 
			  relays.push();
			  relaysCount++;
			  uint128 relayId = relaysCount;
			  relays[relayId].relayAddress = to;
			  relays[relayId].timestamp = block.timestamp;
			  relaysIndex[to] = relayId;
			  
			  emit RelayAdded(to, relayId);
			  emit Roothash( 0, relays[relayId].timestamp, relayId);
		 }
   
  
		 function add(  uint256 permalink, 
		 				uint128 version,
		 				uint256 oldRoot,
		 				uint256 newRoot)
			 external whenNotPaused onlyRelay
		 { 
			 // TODO: add ZK verification of newRoot
			  uint128 relayId = relaysIndex[msg.sender];
			  require(oldRoot == relays[relayId].roothash, "LIST03 wrong roothash");
			  require(versions[permalink].relayId == 0, "LIST04 already added");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  emit Roothash( newRoot, relays[relayId].timestamp, relayId);
			  
			  versions[permalink].version = version;
			  versions[permalink].relayId = relayId;
			  emit Version(permalink, version, relayId); 
		 }
		 
		 function update(	uint256 permalink, 
		 					uint128 version,
		 					uint256 oldRoot,
		 					uint256 newRoot)
			 external whenNotPaused onlyRelay
		 { 
			 // TODO: add ZK verification of newRoot
			  uint128 relayId = relaysIndex[msg.sender];
			  require(oldRoot == relays[relayId].roothash, "LIST05 wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST06 wrong relay");
			  require((version - versions[permalink].version) == 1, "LIST07 wrong version increment");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  emit Roothash( newRoot, relays[relayId].timestamp, relayId);
			  
			  versions[permalink].version = version;
			  emit Version(permalink, version, relayId); 
		 }
		 
		 function revoke(	uint256 permalink, 
		 					uint256 oldRoot,
		 					uint256 newRoot)
			 external whenNotPaused onlyRelay
		 { 
			 // TODO: add ZK verification of newRoot
			  uint128 relayId = relaysIndex[msg.sender];
			  require(oldRoot == relays[relayId].roothash, "LIST08 wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST09 wrong relay");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  emit Roothash( newRoot, relays[relayId].timestamp, relayId);
			  
			  versions[permalink].version = 1;
			  emit Version(permalink, 1, relayId); 
		 }

		 function allowTransfer(uint256 permalink, uint256 roothash)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];
			  require(roothash == relays[relayId].roothash, "LIST10 wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST11 wrong relay");
			  allowedTransfers[relayId][permalink] = roothash;	
		 }


		 function transfer(uint256 permalink, 
		 					uint128 newRelayId, 
		 					uint256 oldRelayOldRoot,
		 					uint256 oldRelayNewRoot,
		 					uint256 newRelayOldRoot,
		 					uint256 newRelayNewRoot)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];
			  require(relayId != newRelayId, "LIST12 cannot transfer to myself");
			  require(newRelayId <= relaysCount, "LIST13 not a relay");
			  require(oldRelayOldRoot == relays[relayId].roothash, "LIST14 wrong roothash");
			  require(newRelayOldRoot == relays[newRelayId].roothash, "LIST15 wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST16 wrong relay");
			  require(allowedTransfers[newRelayId][permalink] == relays[newRelayId].roothash, "LIST17 wrong roothash");

			  relays[newRelayId].timestamp = block.timestamp;
			  relays[newRelayId].roothash = newRelayNewRoot;
			  relays[newRelayId].counter++;
			  emit Roothash( newRelayNewRoot, relays[newRelayId].timestamp, newRelayId);
  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = oldRelayNewRoot;
			  relays[relayId].counter++;
			  emit Roothash( oldRelayNewRoot, relays[relayId].timestamp, relayId);

			  versions[permalink].relayId = newRelayId;
			  emit Version(permalink, versions[permalink].version, newRelayId);  	
		 }

		 // Confirm that roothash is not changed
		 function ping(uint256 roothash)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];
			  require(roothash == relays[relayId].roothash, "LIST18 wrong roothash");
			  relays[relayId].timestamp = block.timestamp;
			  emit Roothash( roothash, relays[relayId].timestamp, relayId);
		 }

		 function getVersion(uint256 permalink)
			  external view returns (uint128)
		 {
			  return versions[permalink].version;			  
		 }
		 
		 function getRelay(uint256 permalink)
			  external view returns (uint128)
		 {
			  return versions[permalink].relayId;			  
		 }
		 
		 function isRevoked(uint256 permalink)
			  external view returns (bool)
		 {
			  return versions[permalink].version == 1;			  
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
}
