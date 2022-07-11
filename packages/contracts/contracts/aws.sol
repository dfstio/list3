pragma solidity 0.8.9;
//SPDX-License-Identifier: MIT
// Version 3.00

contract ScoreAWS
{
	mapping(uint256 => uint256) public score; // permalink => Score
	
	event ScoreIncreased(uint256 indexed permalink, uint256 newScore);

	
	function addScore(uint256 permalink) external 
	{
    	 score[permalink]++;
    	 emit ScoreIncreased( permalink, score[permalink]);
	}
	
	function setScore(uint256 permalink, uint256 value) external 
	{
    	 score[permalink] = value;
    	 emit ScoreIncreased( permalink, score[permalink]);
	}
	
	
}