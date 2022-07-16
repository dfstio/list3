pragma solidity 0.8.9;
//SPDX-License-Identifier: MIT
// Version 3.00




interface IVerifier {

    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[4] memory input
        ) external view returns (bool r);
} 



interface IBridge {

		function verify(  bytes calldata proofData,
						  address contractAddress,
						  bytes calldata storageKey,
						  bytes calldata value,
						  uint256 blockhashExpiryMinutes) 
				external view returns (bool valid, string memory reason);
				
		function verifyHash( bytes calldata proofData,
							 address contractAddress,
							 bytes calldata storageKey,
							 bytes calldata value,
							 uint256 blockhashExpiryMinutes,
							 bytes32 _blockhash,
							 uint256 _timestamp) 
				external view returns (bool valid, string memory reason);



		function getMapStorageKey(uint256 index, uint256 mapPosition) 
				external pure returns (bytes memory data); 

}


contract Load
{

	mapping(uint256 => uint256) public score; // permalink => Score
	
	event ScoreSync(uint256 indexed permalink, uint256 newScore);
	event ScoreIncreased(uint256 indexed permalink, uint256 newScore);

    IVerifier public verifier;
    IBridge   public bridge;


    constructor(IVerifier _verifier, IBridge _bridge) 
    {
			verifier = _verifier;
			bridge = _bridge;
    }

	function verify(uint256 permalink, 	// permalink on our records
					  uint[2] memory a,		// proof of exclusion/inclusion
					  uint[2][2] memory b,
					  uint[2] memory c,
					  uint[4] memory input) external // roothash, permalink, version, isExclusion
	{
    	 require( verifier.verifyProof(a, b, c, input) == true, "wrong proof");
    	 
    	 score[permalink]++;
    	 emit ScoreIncreased( permalink, score[permalink]);
	}

	
	function syncScore( uint256 permalink, 		// permalink
						bytes calldata newScore, // new score
						bytes calldata proof,   // AWS proof,
						address contractAddress,// AWS Score address
						uint256 blockhashExpiryMinutes) // hash must be less then blockhashExpiryMinutes minutes old
							external
	{
    	 bytes memory storageKey = bridge.getMapStorageKey(permalink, 0);

		 (bool valid, string memory reason) = 
		 	bridge.verify(proof, contractAddress, storageKey, newScore, blockhashExpiryMinutes);
		 require( valid, reason);	
    	 
    	 score[permalink] = bytesToUint(newScore);
    	 emit ScoreSync( permalink, score[permalink]);
	}

	function bytesToUint(bytes memory b) internal pure returns (uint256)
	{
        uint256 number;
        for(uint i=0;i<b.length;i++){
            number = number + uint(uint8(b[i]))*(2**(8*(b.length-(i+1))));
        }
    	return number;
	}
	
}
