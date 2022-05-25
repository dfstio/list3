// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {RLPReader} from "@maticnetwork/fx-portal/contracts/lib/RLPReader.sol";
import {MerklePatriciaProof} from "@maticnetwork/fx-portal/contracts/lib/MerklePatriciaProof.sol";
import {Merkle} from "@maticnetwork/fx-portal/contracts/lib/Merkle.sol";
import "@maticnetwork/fx-portal/contracts/lib/ExitPayloadReader.sol";



contract ICheckpointManager {
    struct HeaderBlock {
        bytes32 root;
        uint256 start;
        uint256 end;
        uint256 createdAt;
        address proposer;
    }

    /**
     * @notice mapping of checkpoint header numbers to block details
     * @dev These checkpoints are submited by plasma contracts
     */
    mapping(uint256 => HeaderBlock) public headerBlocks;
}

contract ListHash {
    using RLPReader for RLPReader.RLPItem;
    using Merkle for bytes32;
    using ExitPayloadReader for bytes;
    using ExitPayloadReader for ExitPayloadReader.ExitPayload;
    using ExitPayloadReader for ExitPayloadReader.Log;
    using ExitPayloadReader for ExitPayloadReader.LogTopics;
    using ExitPayloadReader for ExitPayloadReader.Receipt;

    // keccak256(MessageSent(bytes))
    bytes32 public constant VERSION_EVENT_SIG  = 0x40779ce7063d5f55ba195a4101faa644098b5c4e985b7d57f5f326e4f6e2af84;
    bytes32 public constant ROOTHASH_EVENT_SIG = 0xf467dc3352c24e3163f55b7f0140fcc06603b14efe5ea1997d0b32da739f4101;


    // root chain manager
    ICheckpointManager public checkpointManager;
    // child tunnel contract which receives and sends messages
    address public fxChildTunnel;

    constructor(address _checkpointManager,address _fxChildTunnel) {
        checkpointManager = ICheckpointManager(_checkpointManager);
        fxChildTunnel = _fxChildTunnel;
    }


    function _validateAndExtractMessage(bytes memory inputData) 
    				internal view returns (ExitPayloadReader.Log memory log, uint256 timestamp) {
        ExitPayloadReader.ExitPayload memory payload = inputData.toExitPayload();

        bytes memory branchMaskBytes = payload.getBranchMaskAsBytes();
        uint256 blockNumber = payload.getBlockNumber();
        		
        ExitPayloadReader.Receipt memory receipt = payload.getReceipt();
        log = receipt.getLog();


        // check child tunnel
        require(fxChildTunnel == log.getEmitter(), "FxRootTunnel: INVALID_FX_CHILD_TUNNEL");

        bytes32 receiptRoot = payload.getReceiptRoot();
        // verify receipt inclusion
        require(
            MerklePatriciaProof.verify(receipt.toBytes(), branchMaskBytes, payload.getReceiptProof(), receiptRoot),
            "FxRootTunnel: INVALID_RECEIPT_PROOF"
        );

        // verify checkpoint inclusion
        _checkBlockMembershipInCheckpoint(
            blockNumber,
            payload.getBlockTime(),
            payload.getTxRoot(),
            receiptRoot,
            payload.getHeaderNumber(),
            payload.getBlockProof()
        );

		timestamp = payload.getBlockTime();
        return (log, timestamp);
    }

    function _checkBlockMembershipInCheckpoint(
        uint256 blockNumber,
        uint256 blockTime,
        bytes32 txRoot,
        bytes32 receiptRoot,
        uint256 headerNumber,
        bytes memory blockProof
    ) private view returns (uint256) {
        (bytes32 headerRoot, uint256 startBlock, , uint256 createdAt, ) = checkpointManager.headerBlocks(headerNumber);

        require(
            keccak256(abi.encodePacked(blockNumber, blockTime, txRoot, receiptRoot)).checkMembership(
                blockNumber - startBlock,
                headerRoot,
                blockProof
            ),
            "FxRootTunnel: INVALID_HEADER"
        );
        return createdAt;
    }

    /**
     * @notice receive message from  L2 to L1, validated by proof
     * @dev This function verifies if the transaction actually happened on child chain
     *
     * @param proof RLP encoded data of the reference tx containing following list of fields
     *  0 - headerNumber - Checkpoint header block number containing the reference tx
     *  1 - blockProof - Proof that the block header (in the child chain) is a leaf in the submitted merkle root
     *  2 - blockNumber - Block number containing the reference tx on child chain
     *  3 - blockTime - Reference tx block time
     *  4 - txRoot - Transactions root of block
     *  5 - receiptRoot - Receipts root of block
     *  6 - receipt - Receipt of the reference transaction
     *  7 - receiptProof - Merkle proof of the reference receipt
     *  8 - branchMask - 32 bits denoting the path of receipt in merkle tree
     *  9 - receiptLogIndex - Log Index to read from the receipt
     */
     
    function getVersion(bytes memory proof) 
    		public view returns ( uint256 roothash, uint256 timestamp, uint256 permalink, uint128 version, uint128 relayId) {
    		
    		(ExitPayloadReader.Log memory log, uint256 _timestamp) = _validateAndExtractMessage(proof);
    		ExitPayloadReader.LogTopics memory topics = log.getTopics();
    		require(bytes32(topics.getField(0).toUint()) == VERSION_EVENT_SIG, // topic0 is event sig
            		"FxRootTunnel: INVALID_SIGNATURE");

			roothash = topics.getField(3).toUint();		
			permalink = topics.getField(1).toUint();   
			version = abi.decode(log.getData(), (uint128));
			relayId = uint128(topics.getField(2).toUint());
			
			return (roothash, _timestamp, permalink, version, relayId);		
    }

    function getRoothash(bytes memory proof) 
    		public view returns ( uint256 roothash, uint256 timestamp, uint128 relayId ) {
     		(ExitPayloadReader.Log memory log, uint256 _timestamp) = _validateAndExtractMessage(proof);
    		ExitPayloadReader.LogTopics memory topics = log.getTopics();
    		require(bytes32(topics.getField(0).toUint()) == ROOTHASH_EVENT_SIG, // topic0 is event sig
            		"FxRootTunnel: INVALID_SIGNATURE");

			roothash = topics.getField(1).toUint();
			relayId = uint128(topics.getField(2).toUint());
			
			return (roothash, _timestamp, relayId);			
    }
}
