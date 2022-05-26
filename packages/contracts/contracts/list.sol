pragma solidity 0.8.9;
//SPDX-License-Identifier: MIT
// Version 3.20


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


interface IVerifierAdd {

    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[4] memory input
        ) external view returns (bool r);
} 

interface IVerifierUpdate {        
            function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[5] memory input
        ) external view returns (bool r);
}


interface IVerifierRevoke {        
            function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[4] memory input
        ) external view returns (bool r);
}

interface IVerifierAddRevoked {
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[4] memory input
        ) external view returns (bool r);
} 

interface IVerifierPermalink {

    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[1] memory input
        ) external view returns (bool r);
} 
        

        
        
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
			   bool isActive; 		// if false operations of relay are suspended except for transfers from relay
			   string ipfsHash; 	// IPFS hash of JSON configuration file describing relay API access
		}	
	 
		Relay[] public relays; // relays numbering starts from 1, relay[0] is empty
		uint128 public relaysCount; 
		mapping(address => uint128) public relaysIndex; // relayAddress => index in relays[]
	   
		// allowed transfers between relays
		// old relayId  => permalink => old relay's roothash
		mapping (uint128 => mapping(uint256 => uint256)) public allowedTransfers; 

		// Events
		event Version(uint256 indexed permalink, uint128 version, uint128 indexed relayId, uint256 indexed roothash); // new version recorded
		event Roothash(uint256 indexed roothash, uint128 indexed relayId); // Relay's roothash changed
		event Transfer(uint256 indexed permalink, uint128 indexed fromRelayId, uint128 indexed toRelayId);
		event Seal(uint256 indexed permalink, uint128 version, uint128 indexed relayId, uint256 indexed roothash); // version is sealed

		event RelayAdded(address indexed relayAddress, uint128 indexed relayId); // Added new relay
		event RelayConfig(uint128 indexed relayId, string ipfsHash); 
		event ShutdownRelay(uint128 indexed relayId);

		IVerifierAdd verifierAdd;
		IVerifierUpdate verifierUpdate;
		IVerifierRevoke verifierRevoke;
		IVerifierAddRevoked verifierAddRevoked;
		IVerifierPermalink verifierPermalink;

		function initialize(IVerifierAdd _verifierAdd, 
							IVerifierUpdate _verifierUpdate, 
							IVerifierRevoke _verifierRevoke, 
							IVerifierAddRevoked _verifierAddRevoked,
							IVerifierPermalink _verifierPermalink) public initializer {
			 __Ownable_init();
			 __Pausable_init();
			 verifierAdd = _verifierAdd;
			 verifierUpdate = _verifierUpdate;
			 verifierRevoke = _verifierRevoke;
			 verifierAddRevoked = _verifierAddRevoked;
			 verifierPermalink = _verifierPermalink;
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
				 return 320; // 320 = version 3.20
		 }
   
		 function addRelay(address to)
			  external whenNotPaused onlyOwner
		 {
			  require((relaysIndex[to] == 0) , "LIST02: relay already added"); 
			  relays.push();
			  relaysCount++;
			  uint128 relayId = relaysCount;
			  relays[relayId].relayAddress = to;
			  relays[relayId].isActive = true;
			  relays[relayId].timestamp = block.timestamp;
			  relaysIndex[to] = relayId;
			  
			  emit RelayAdded(to, relayId);
			  emit Roothash( 0, relayId);
		 }
		 
		 function shutdownRelay(address to)
			  external onlyOwner
		 {
			  uint128 relayId = relaysIndex[to];
			  require( relayId > 0, "LIST02a: not a relay"); 
			  relays[relayId].isActive = false;
			  
			  emit ShutdownRelay(relayId);
		 }
  
  		 function setRelayConfig(string memory ipfsHash)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];			  
			  relays[relayId].ipfsHash = ipfsHash;
			  emit RelayConfig(relayId, ipfsHash); 
		 }
 
  
		 function add( uint[2] memory a,
					   uint[2][2] memory b,
					   uint[2] memory c,
					   uint[4] memory input,
					   uint[2] memory ap,
            		   uint[2][2] memory bp,
                       uint[2] memory cp,
                       uint[1] memory inputp) 
			 external whenNotPaused onlyRelay
		 { 
              require( verifierAdd.verifyProof(a, b, c, input) == true, "LIST03a wrong proof");
              require( verifierPermalink.verifyProof(ap, bp, cp, inputp) == true, "LIST03b wrong proof");
			  uint128 relayId = relaysIndex[msg.sender];
			  uint256 newRoot 	= input[0];
			  uint256 oldRoot 	= input[1];
			  uint256 permalink = input[2];
			  require(permalink == inputp[0], "LIST03c wrong permalink");
			  uint128 version 	= uint128(input[3]);
			  require(oldRoot == relays[relayId].roothash, "LIST03 wrong roothash");
			  require(versions[permalink].relayId == 0, "LIST04 already added");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  
			  versions[permalink].version = version;
			  versions[permalink].relayId = relayId;
			  emit Version(permalink, version, relayId, newRoot); 
		 }


		 
		 
		 function update( uint[2] memory a,
						  uint[2][2] memory b,
						  uint[2] memory c,
						  uint[5] memory input,
						  uint[2] memory ap,
						  uint[2][2] memory bp,
						  uint[2] memory cp,
						  uint[1] memory inputp) 
			 external whenNotPaused onlyRelay
		 { 
			  require( verifierUpdate.verifyProof(a, b, c, input) == true, "LIST05a wrong proof");
              require( verifierPermalink.verifyProof(ap, bp, cp, inputp) == true, "LIST05b wrong proof");
			  uint256 newRoot 	= input[0];
			  uint256 oldRoot 	= input[1];
			  uint128 oldVersion = uint128(input[2]);
			  uint256 permalink = input[3];
			  require(permalink == inputp[0], "LIST05c wrong permalink");
			  uint128 version = uint128(input[4]);
			  uint128 relayId = relaysIndex[msg.sender];
			  require(oldRoot == relays[relayId].roothash, "LIST05 wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST06 wrong relay");
			  require(oldVersion == versions[permalink].version, "LIST07a wrong old version");
			  require((version - oldVersion) == 1, "LIST07b wrong version increment");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  
			  versions[permalink].version = version;
			  emit Version(permalink, version, relayId, newRoot); 
		 }
		 
		 function revoke( uint[2] memory a,
						  uint[2][2] memory b,
						  uint[2] memory c,
						  uint[4] memory input,
						  uint[2] memory ap,
						  uint[2][2] memory bp,
						  uint[2] memory cp,
						  uint[1] memory inputp) 

			 external whenNotPaused onlyRelay
		 { 
			  require( verifierRevoke.verifyProof(a, b, c, input) == true, "LIST08a wrong proof");
              require( verifierPermalink.verifyProof(ap, bp, cp, inputp) == true, "LIST08b wrong proof");
			  uint256 newRoot 	= input[0];
			  uint256 oldRoot 	= input[1];
			  uint256 permalink = input[2];
			  require(permalink == inputp[0], "LIST08c wrong permalink");
			  uint128 version = uint128(input[3]);
			  uint128 relayId = relaysIndex[msg.sender];
			  require(oldRoot == relays[relayId].roothash, "LIST08d wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST08e wrong relay");
			  require(version == 1, "LIST08f wrong version");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;			  
			  versions[permalink].version = 1;
			  
			  emit Version(permalink, 1, relayId, newRoot); 
		 }

		 function addrevoked( uint[2] memory a,
							  uint[2][2] memory b,
							  uint[2] memory c,
							  uint[4] memory input,
							  uint[2] memory ap,
							  uint[2][2] memory bp,
							  uint[2] memory cp,
							  uint[1] memory inputp) 
			 external whenNotPaused onlyRelay
		 { 
              require( verifierAddRevoked.verifyProof(a, b, c, input) == true, "LIST10a wrong proof");
              require( verifierPermalink.verifyProof(ap, bp, cp, inputp) == true, "LIST10b wrong proof");
			  uint128 relayId = relaysIndex[msg.sender];
			  uint256 newRoot 	= input[0];
			  uint256 oldRoot 	= input[1];
			  uint256 permalink = input[2];
			  require(permalink == inputp[0], "LIST10c wrong permalink");
			  uint128 version 	= uint128(input[3]);
			  require(oldRoot == relays[relayId].roothash, "LIST10d wrong roothash");
			  require(versions[permalink].relayId == 0, "LIST10e already added");
			  require(version == 1, "LIST10e wrong version");
			  
			  relays[relayId].timestamp = block.timestamp;
			  relays[relayId].roothash = newRoot;
			  relays[relayId].counter++;
			  
			  versions[permalink].version = 1;
			  versions[permalink].relayId = relayId;
			  emit Version(permalink, 1, relayId, newRoot); 
		 }

		 // Allow transfer from relay
		 function allowTransfer(uint256 permalink, uint256 roothash)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];
			  require(roothash == relays[relayId].roothash, "LIST11a wrong roothash");
			  require(versions[permalink].relayId == relayId, "LIST11b wrong relay");
			  allowedTransfers[relayId][permalink] = roothash;	
		 }

		 // Allow transfer from suspended relay
		 function allowForcedTransfer(uint256 permalink, uint128 relayId, uint256 roothash)
			 external whenNotPaused onlyOwner
		 { 
			  require(relayId <= relaysCount, "LIST10 wrong relayId");
			  require(roothash == relays[relayId].roothash, "LIST10a wrong roothash");
			  require(relays[relayId].isActive == false, "LIST10b please shutdown relay first");
			  require(versions[permalink].relayId == relayId, "LIST11 wrong relay");
			  allowedTransfers[relayId][permalink] = roothash;	
		 }

		 function transfer(uint256 permalink, 
		 					uint128 oldRelayId,	 
		 					uint256 oldRelayOldRoot,
		 					uint256 oldRelayNewRoot,
		 					uint256 newRelayOldRoot,
		 					uint256 newRelayNewRoot)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 newRelayId = relaysIndex[msg.sender];
			  require(oldRelayId != newRelayId, "LIST12 cannot transfer to myself");
			  require(newRelayId <= relaysCount, "LIST13 not a relay");
			  require(oldRelayOldRoot == relays[oldRelayId].roothash, "LIST14 wrong roothash");
			  require(newRelayOldRoot == relays[newRelayId].roothash, "LIST15 wrong roothash");
			  require(versions[permalink].relayId == oldRelayId, "LIST16 wrong relay");
			  require(allowedTransfers[newRelayId][permalink] == relays[newRelayId].roothash, "LIST17 wrong roothash");

			  relays[newRelayId].timestamp = block.timestamp;
			  relays[newRelayId].roothash = newRelayNewRoot;
			  relays[newRelayId].counter++;
			  
  
			  relays[oldRelayId].timestamp = block.timestamp;
			  relays[oldRelayId].roothash = oldRelayNewRoot;
			  relays[oldRelayId].counter++;
			  

			  versions[permalink].relayId = newRelayId;
			  emit Version(permalink, versions[permalink].version, newRelayId, newRelayNewRoot);  
			  emit Roothash( oldRelayNewRoot, oldRelayId);
			  emit Transfer(permalink, oldRelayId, newRelayId); // relays should ping after the transfer to confirm the state	
		 }

		 // Confirm that roothash is not changed
		 function ping(uint256 roothash)
			 external whenNotPaused onlyRelay
		 { 
			  uint128 relayId = relaysIndex[msg.sender];
			  require(roothash == relays[relayId].roothash, "LIST18 wrong roothash");
			  relays[relayId].timestamp = block.timestamp;
			  emit Roothash( roothash, relayId);
		 }

		 function seal(uint256 permalink) 
			 external whenNotPaused 
		 { 
			  uint128 relayId = versions[permalink].relayId;
			  emit Seal(permalink, versions[permalink].version, relayId, relays[relayId].roothash); 
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
	
		 function isVersionUnchanged(uint256 permalink, uint128 version)
			  external view returns (bool)
		 {
			  return versions[permalink].version == version;			  
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
