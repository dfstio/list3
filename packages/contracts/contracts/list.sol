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
			address adr;
			uint256 version;
			string hash;
		}

	  // Address properties
	  mapping(address => uint256) public versions;
	  Record[] public records;  
	 
	 // Verifier sync
	  uint256 public roothash;
	  uint256 public syncCounter;
	 

	  // Events
	  event Version(address indexed _address, uint256  _version, string _hash);
	  event Sync(uint256 _roothash, uint256 _syncCounter);
	  event ModeratorChanged(address _address, bool _status);

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
			   return 100; // 100 = version 1.00
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
  
 
  
		 function add(address to, uint256 version, string memory hash)
			 external whenNotPaused onlyModerator
		 { 
			  records.push();
			  uint counter = records.length - 1;
			  records[counter].adr = to ;
			  records[counter].version = version ;
			  records[counter].hash = hash ;
		  
			  versions[to] = counter; 

			  emit Version(to, version, hash);
		 }
  

  
		function getRecordsCount()
			 external view returns (uint)
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
		 
		 function sync(	 uint256 _roothash )
			 external whenNotPaused onlyOwner
		{
			 roothash = _roothash;
			 syncCounter = records.length;
			 emit Sync(_roothash, syncCounter );			 
		}

  
}
