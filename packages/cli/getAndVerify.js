const GetProof = require('./getProof')
const VerifyProof = require('./verifyProof')
const { toBuffer } = require('eth-util-lite')

class GetAndVerify{
  constructor(rpcProvider = "https://mainnet.infura.io"){
    this.get = new GetProof(rpcProvider)
  }

  async txAgainstBlockHash(txHash, trustedBlockHash){
    let resp = await this.get.transactionProof(txHash)
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    let txRootFromHeader = VerifyProof.getTxsRootFromHeader(resp.header)
    let txRootFromProof = VerifyProof.getRootFromProof(resp.txProof)
    if(!txRootFromHeader.equals(txRootFromProof)) throw new Error('TxRoot mismatch')
    return VerifyProof.getTxFromTxProofAt(resp.txProof, resp.txIndex)
  }
  async receiptAgainstBlockHash(txHash, trustedBlockHash){
    let resp = await this.get.receiptProof(txHash)
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    let receiptsRoot = VerifyProof.getReceiptsRootFromHeader(resp.header)
    let receiptsRootFromProof = VerifyProof.getRootFromProof(resp.receiptProof)
    if(!receiptsRoot.equals(receiptsRootFromProof)) throw new Error('ReceiptsRoot mismatch')
    return VerifyProof.getReceiptFromReceiptProofAt(resp.receiptProof, resp.txIndex)
  }
  async accountAgainstBlockHash(accountAddress, trustedBlockHash){
    let resp = await this.get.accountProof(accountAddress, trustedBlockHash)
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    let stateRoot = VerifyProof.getStateRootFromHeader(resp.header)
    let stateRootFromProof = VerifyProof.getRootFromProof(resp.accountProof)
    if(!stateRoot.equals(stateRootFromProof)) throw new Error('StateRoot mismatch')
    return VerifyProof.getAccountFromProofAt(resp.accountProof, accountAddress)
  }
  async storageAgainstBlockHash(accountAddress, position, trustedBlockHash){
     console.log("storageAgainstBlockHash called:", accountAddress, position, trustedBlockHash);
    let resp = await this.get.storageProof(accountAddress, position, trustedBlockHash)
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    console.log("blockHashFromHeader:", blockHashFromHeader);
    let stateRoot = VerifyProof.getStateRootFromHeader(resp.header)
    let stateRootFromProof = VerifyProof.getRootFromProof(resp.accountProof)
    if(!stateRoot.equals(stateRootFromProof)) throw new Error('StateRoot mismatch')
    console.log("stateRoot:", stateRoot);
    let account = await VerifyProof.getAccountFromProofAt(resp.accountProof, accountAddress)
    console.log("account:", account );
    let storageRoot = VerifyProof.accountContainsStorageRoot(account)
    console.log("storageRoot:", storageRoot );
    let storageRootFromProof = VerifyProof.getRootFromProof(resp.storageProof)
    if(!storageRoot.equals(storageRootFromProof)) throw new Error('StorageRoot mismatch')
    
    return VerifyProof.getStorageFromStorageProofAt(resp.storageProof, position)
  }

  async storageAgainstBlockNumber(accountAddress, position, trustedBlockNumber, trustedBlockHash){
    console.log("storageAgainstBlockHash called:", accountAddress, position, trustedBlockHash);
    let resp = await this.get.storageProofByBlockNumber(accountAddress, position, trustedBlockNumber)
    //console.log("resp", resp);
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    // London fork - disable now
    //if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    console.log("blockHashFromHeader:", "0x" + blockHashFromHeader.toString('hex'));
    let stateRoot = VerifyProof.getStateRootFromHeader(resp.header)
    let stateRootFromProof = VerifyProof.getRootFromProof(resp.accountProof)
    if(!stateRoot.equals(stateRootFromProof)) throw new Error('StateRoot mismatch')
    console.log("stateRoot:",  "0x" + stateRoot.toString('hex'));
    let account = await VerifyProof.getAccountFromProofAt(resp.accountProof, accountAddress)
    console.log("account:", account );
    let storageRoot = VerifyProof.accountContainsStorageRoot(account)
    console.log("storageRoot:",  "0x" + storageRoot.toString('hex') );
    let storageRootFromProof = VerifyProof.getRootFromProof(resp.storageProof)
    if(!storageRoot.equals(storageRootFromProof)) throw new Error('StorageRoot mismatch')
    const value = await VerifyProof.getStorageFromStorageProofAt(resp.storageProof, position);
    
    return { value: value,
    		 proof: resp };
  }



  async _logAgainstBlockHash(txHash, indexOfLog, trustedBlockHash){
    // untested as of yet
    let resp = await this.get.receiptProof(txHash)
    let blockHashFromHeader = VerifyProof.getBlockHashFromHeader(resp.header)
    if(!toBuffer(trustedBlockHash).equals(blockHashFromHeader)) throw new Error('BlockHash mismatch')
    let receiptsRoot = VerifyProof.getReceiptsRootFromHeader(resp.header)
    let receiptsRootFromProof = VerifyProof.getRootFromProof(resp.receiptProof)
    if(!receiptsRoot.equals(receiptsRootFromProof)) throw new Error('ReceiptsRoot mismatch')
    let receipt = await VerifyProof.getReceiptFromReceiptProofAt(resp.receiptProof, resp.txIndex)
    return VerifyProof.receiptContainsLogAt(receipt, indexOfLog)
  }
}

module.exports = GetAndVerify
