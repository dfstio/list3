// insert in contract Verifier 

    address private immutable _owner;
    uint public root;
    event Root(uint256 _root);

    constructor(address owner) public {
        _owner = owner;
    }

    function setroot( uint _root)
		 external 
	{
	     require(msg.sender == _owner, "not a owner"); 
		 root = _root;
		 emit Root(_root );			 
	}


      
      
      
      
      
      // insert in function verifyProof
        require(root == input[0] , "wrong root - please regenerate proof"); 