const {RPC_AWS_ENDPOINT, SCOREAWS_ADDRESS, KEY_OWNER, SCORE_ADDRESS,
		RPC_GOERLI, RPC_MUMBAI, BRIDGE_MUMBAI, BRIDGE_GOERLI, PROVER_MUMBAI, SCOREMUMBAI_ADDRESS } = require('@list/config');


const BridgeJSON = require("@list/contracts/abi/contracts/bridge.sol/Bridge.json");
const ProverJSON = require("@list/contracts/abi/contracts/prover.sol/MerkleProver.json");
const ScoreJSON = require("@list/contracts/abi/contracts/score.sol/Score.json");
const ethers = require("ethers");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const rlp = require('rlp');
const web3 = require('web3');

const axios = require('axios');
const GetAndVerify =  require('./getAndVerify.js')

const {POSClient, setProofApi, use} = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
use(Web3ClientPlugin);

function expandkey(hexvalue) {
    if (hexvalue.substring(0, 2) === '0x') hexvalue = hexvalue.substring(2);
    return [...new Array(hexvalue.length).keys()]
        .map(i => '0' + hexvalue[i])
        .join('')
}

function buffer2hex(buffer) {
    return '0x' + Buffer.from(buffer).toString('hex');;
}

const account2 = {
    "accountProof": [
        "0xf90211a0bfc58b2add1bffdcd2a7763a7f478be005b36d565c2ec2fbe5deaeb3262f9a04a07ba64ed6c53814ff6c7eafe39730b59ba58774a73b0f2146ed30dd6b87312e83a0f5d249c2351dacad258c6fbe3a7b9f08b15f76af92740ac15a6dad6f8fb3d311a09ce9f9086e87f7e7609ae73d587ba6d5b7debc959c0305c79dc773d609c6156ea0e08a20676f727cc68b609b7801d9815eabd9975ecb8dac46de48c21378ae5e74a05f2178001bc74910d832b658da0a053dae65310290092b0313128cd01d1c4fc6a0847d8407acb63e33fb4e3ccf6a03fd0e6ec3a32888f0f66e203b64b8713bc9d5a0b23385e0fa6734a94e75bda64239652327b184106e1f32596e45b2e901056fbfa04b8a4d10be27e3d0d35b417dd434de90ac5ef49115eb1fabfab261c6d7514d26a0671bfb9f5b7252fe6d034119e1975a0f572cdf49b759b840bdf20ed6829e6e09a00ce95ca7fd8631bba02929d54c7ceccff01d373b2f032efcbf36a3f2b58a3148a09f29714fa97b47ca45302c7c44803241e4ce836cc174b09faf76c5dc776a7ab8a0c1d2a36de09308e89fa138305ace4079266b1bac2debaf8113c1abee4000b0a6a0ff33fb2a46498c8c505acde3b4f872e9be1554b5bf9e9e86dcc56b0ed08a614aa067b5dab471128ac562cf715e02e9a22d772e4e2bda937cf1509e81f0093302e1a04062c7e2c00700e0769e5fea1bf62b2d75b517efd2fca46e1962252037ec467a80",
        "0xf90211a092db8b0316899e922be2a36281367179ade4c76c94b42d15d4ab1fd86de2b5bba0a849dc5eac333273a63afee1296a296c019dce9d2579dab076d4bba6654d90b7a09104e1df5a78c06f856bc17db3dadea653476050ff84612ccc9f3e1aa64fcd3ba0de258b9cba04d4edfb594f241994526decc38354a08863cf5b999fa9e2b23b2ba00ac31b8cbe3b283b9e34bb00f974fe0c175c30a974f0a96b39e9c2a434a517aea002ebd2e0526d75dbd13445bbe51ec1863d955330d4672c8510eccb8a0411991da039357b715fa91f45243bffda886f405efc84404d6899de0c95023442a866a041a0ab67208e8d6ed0b5d1fb203e760e15d56cbede1151922da9f279a50e82262253a02cf3feaf53f11751cce2e644b3e56d98cc243f2f2ba6907bbc1b3483cb468134a032762fa4497b845e1bfe6fd56f680dc7771d5c9642323bc5bb35678cc4d849e7a066457b39caea6811111deb3fdf5d35111700364d160349e0517378095d480e3da06322e015fd171059167243b37ea94772e10c43c66df545b6cf82fd513409b983a06154c626d99a75234ae2f14c8a07666d5a334107d0c081f9cff98c3a9f0baaefa0a410fd646a09849126ab7ef01953b7915989190cde58753617531cda484811eea06ff016571529d477ec03ab55aa98c3bce979bc7ebd3553c3eb9864bb5cdcf5f8a0ede0c26142e1cad274185793910f79be4a76c5a5ea92e809a4cdda5d8565e2dc80",
        "0xf90211a0d43aada16d586df6d0f63720d6db1fc8adca367a9759cbb9549b0a8468ea7748a064c61515a7466fd9f40aa18c986e9a765aaa0101abf1b7d4da0e71686636b3ffa06e26d8a29e7dca205c92ea246be4552272bce13778d3fb0c8d16f3c8ce1c9c0ea041052d7255418523303398b1d085c8fc7152dd08a370854ba8c5eac0e34118c6a0b9f7fd79f6e3beca8104542cc97ff73658f629e71868dc8d1b912160ffcec9ada03057afe819091e836f04ad0b5ae4d5beb9e74bcf6d675fee015b33e51a79167ea0a309c77d95162a51a3f4dd5292a2622dfa23f0a41f9e4fd5aaa83f93a6890d83a01f78912a45fca349185802d49e2e14f8a83b0785f2debb9a765d4fedfd198ad3a0e5e3622da2bac3d1caed41c9fc9773b98a616b9e84def0d1e36d91108df2321aa0f635c44da21fa6610fd9376b534535ab8d0f2a351a7f0d4c631431011aea4ecea0b65ccc5cd6dcd3127705847b814ebfbce0d2d5887e78c2178cdc3de4fe0c61a7a04fe884eb7ba6828661d934a93a60ad3383a11307c56e455a7676ea0538fc6bb6a0107858e84c5ad91ce0382c31e576ffb0b57bbd0da1841c5839debc302889201fa0c00abf05f9dbb9cff7ad37a52082139b07d8d6e1a44c49e1d36fc505e651aaa6a09ba7f1d6eb0ef4446659c05569b7604e5ff9fa15f881a9687433b730f1ea407ca06a24c28345057c15608ba2f4aa56816c144bfe66d849f4ad58d4dc2de405990a80",
        "0xf90211a084dfb82d1e7cc7906560a06368597b6c603d086c795b75d74fde0533668274cfa0c8f454e10ee13a901dd98599f3b7bfacaaf1d6aef8ad399a662fbf2926c7c803a00bb0b975a18b2e22e47cd72572063ce74284a3e9c8e6c9e8c19059d8b7f57b5fa03ab7bfdcd461fb86428775911929189bb0771a3e4e06f6e2f5648b989939de40a02d827a5eb76ac1c67f4d54f8e1f09a11871198b60df4fa402c0aa1e42da7b78aa0ae77b812ba7873680546a667ac4be1071378766dab46ba1ab7f9ef6d2fd82a2aa07e816acf7fa695cd1b5814ef3886926bfb8734a2a97cb2befeec3f36231b4f4fa0483dc1ebdbc059c3595e6d6ab686024e1fa4edd93723ffa14d9ca102357e62f8a0fbc063726638dfd079ae75ece70d49e67d808cb624f7b31834437863d6909c29a0039b7d5a800037c11667a320af2871971be040306a34ae642a9832b3836f68e2a0eb0e84d2c0081bc855db4ad8edbb5c455af934c228549f5e6823683c0414ea12a0961ab772f842612447c3773766f411d816b9fa22fbda03daa2f364771f9c68eba00811416096e43dea9d1d256e4d1d4a12fcd9fb7f2c06dce5a64478dff97eeebda06442bec68c7a790e7a1d5dc3abe8205cec63ec8a161b6f6f4b8a2f18a655dbb7a0e54297898cba903f68fefff0e4f0a4e0654c2db647eb54ecde7a85fbeae85437a07d4fa1b56081e72ce294d47de5f821c7e18dde72ceb841161daf235951120ec280",
        "0xf9019180a0aaf1b3704198b3b234445f45381d6174b6031777b74b225838849af9ea38afe6a03ac1ccf302703952e21ec42a2522b6baa78765c6f21adbd978020142084e1f4980a0d3654355536a37859be489faf6bccc423af926945f91054b42adfe313179554da0f1d076b65339786efa502622c3b5ff3b9d7607f376718f98aaf9f48d73aad71680a03f36ddcfd709268ebc360b3a966b536121d78f4cefdd786aeb236f6e5e57a5ba80a0c84d3c4237a129666f2b192a5d08109f3a5ea84ff1dc954e9cf0c6651b906f98a0bb67f62b58e8ab4a1d10df7b3d9724cd4884198c4d959fbb65c967ba231d4ba9a06c1f1da5df310c8af13ee63ac121daa41ae769d7ba28aefb703ed6a5ae8d7a56a0cd0abd682816b9fa9dd34ddb92486ef80683d13871a10190bf010676f5817abda0ed71efe46364a9fdd89248f0f6be6ea5a507b52e412f7455690ee611b538c14ea07b0c5169b0428a302a5f446bd44cbab89e498f7e341d66699fd708329eb8fd28a02cc1bb53767bc60b425f9c58b3f66105a2889d83e63ba56f813c51cde64178dd80",
        "0xf891a0d406ca542c96088d98e3fd9f5cd6f61c778ffadb7f4c06f7ebe22e888970291d80a03834a167789da236dd82c9e1520f735ed390115fba8e8643e4c214bac3dd6be08080808080a03953f3aef8b24c28eef1a21c0cedd531b580eec7eda297bed8493c28e0340ea78080808080a0d3d24fbfd65b8c5f99e46f5bdc3b42bb487de884a78403344601749334d00b378080",
        "0xf86e9e20eec55fb2d91185835e2876436317d2eaf1ca8ac92ee1d2ad221cb09558b84df84b018711c37937e08000a0595b6b8bfaad7a24d0e5725ba86887c81a9d99ece3afcce1faf508184fcbe681a03b4e727399e02beb6c92e8570b4ccdd24b6a3ef447c89579de5975edd861264e"
    ],
    "address": "0x27a37a1210df14f7e058393d026e2fb53b7cf8c1",
    "balance": "0x11c37937e08000",
    "codeHash": "0x3b4e727399e02beb6c92e8570b4ccdd24b6a3ef447c89579de5975edd861264e",
    "nonce": "0x1",
    "storageHash": "0x595b6b8bfaad7a24d0e5725ba86887c81a9d99ece3afcce1faf508184fcbe681",
    "storageProof": [
        {
            "key": "0x0",
            "proof": [
                "0xf90191a08ec53dd8851dc61321b09120b82ea16770afddd8611a482d75973a0b58888a3f80a01b14d1d77a7833f6b931de9508956156d197b320cea2010f7ac25afa3911926680a02924a89b120cc2c73b30258c37d679d73d7f30ca75a3a87bb8d1fb15ce21494ba0f4e1c10f6da0145ce689bc8737878d63bc52bd68c3c2e3e084f8db47e72dd3e9a05eb6b8a31a12dbc9148f579b664cf0680340d256fde1479f726c285112be1ea0a05fdc7b5c1f8835394addd906e228eb1580fe790d4dd65411ebcbc3f7e0dca0ca80a0fe52a88b5a8e97cb2a1842a9079e247fc57e0684ed9f2615d0aee9b560c68057a09c6b2b9e11964a844b3825acad6e79472c0f92fa9b771ee36017665bdd97c25ba09e2cecd84d9dc8cc59d80d2750d14d23c35003d7891b281ffe291bb5ff34c089a0316d90d6ca0bfc0fd81147f6543e2a4bfaf4850dbd2aa19032e4b98202d869bf80a017616bfb3469cb609cb4382805aac33fccb6a0e24ac5c82e38b5519124d263ffa02d096228ecc4cf88798b93de30b931cb335b5d7ea8692b931a230fb0252f573380",
                "0xf87180808080808080a086cc153c6dc404f31aaaececb715e1a64e2fca4a20f78f043eaef178d046789880a081b7693d9ef9dea4b83b27e12fd4a86cfd861c266865545c3602ec6a1e43039da09239b9f44595c71294252e4ffd9060fff5435433cef974f918d12021449cf581808080808080",
                "0xe2a0200decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56305"
            ],
            "value": "0x05"
        }
    ],
    headerData: "0xf90246a05773d1c473964a58035ae1d1e57d2d1e18d7b8e08ced22a523870a737700b690a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479400d6cc1ba9cf89bd2e58009741f4f7325badc0eda01e37fa5377acb4e455ed0843b69424d93b2e2d6419ba3afd3a705cb23d51fab6a0b5185e0bc97b2b1311b7610413e1401bc412b781fe17529decdfb21a4a10f283a0056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2b901000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000090fffffffffffffffffffffffffffffffe83974241837a1200825208845c2bad4c9fde830201088f5061726974792d457468657265756d86312e33302e3082776984170aeb53b8418fbdd08eafdc20977469b355ad6a032f066f526983b287a002a8138fbe3a482a1ca2fcf4788e1494af27c90245d1df3e5fd1b039702f851e39d06ccc378020e301",
    header: {
        hash: '0x0b552efab951231da6438aa6eb4db64189351bc4a8a1b1b8a79531662412fe56',
        parentHash: '0x5773d1c473964a58035ae1d1e57d2d1e18d7b8e08ced22a523870a737700b690',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        miner: '0x00D6Cc1BA9cf89BD2e58009741f4F7325BAdc0ED',
        stateRoot: '0x1e37fa5377acb4e455ed0843b69424d93b2e2d6419ba3afd3a705cb23d51fab6',
        transactionsRoot: '0xb5185e0bc97b2b1311b7610413e1401bc412b781fe17529decdfb21a4a10f283',
        receiptsRoot: '0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        difficulty: '340282366920938463463374607431768211454',
        totalDifficulty: '3402823669209384634633746074317682114549999999',
        number: '9912897',
        gasLimit: '8000000',
        gasUsed: '21000',
        timestamp: '1546366284',
        extraData: '0xde830201088f5061726974792d457468657265756d86312e33302e30827769',
        mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '386591571'
    }
}


async function prove2()
{
	 const storageAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
	 const data = account2;
	 const expectedValue = rlp.decode(data.accountProof[data.accountProof.length - 1])[1];
	 const accountProof = {
		 expectedRoot: data.header.stateRoot,
		 key: '0x' + expandkey(web3.utils.soliditySha3(data.address)),
		 proof: data.accountProof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: buffer2hex(expectedValue),
	 }
	 const ind = 0;
	 const kkkey = '0x' + data.storageProof[ind].key.substring(2).padStart(64, '0');
	 const storageProof = {
		 expectedRoot: data.storageHash,
		 key: '0x' + expandkey(web3.utils.soliditySha3(kkkey)),
		 proof: data.storageProof[ind].proof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: data.storageProof[ind].value,
	 }
	 const header = data.header;


	 
	 
	 const provider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
	 const wallet = new ethers.Wallet(KEY_OWNER);

     const signer = wallet.connect(provider);
	 const prover = new ethers.Contract(PROVER_MUMBAI, ProverJSON, signer);

     
     console.log("prove data: ", accountProof );
     let check = await prover.check(accountProof );
     console.log("checkMerkleProof on Mumbai account response: ", check);


}




async function prove(permalink, value, data, header, blockhash)
{
	//console.log("prove: ", data, header);
	//const storageAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';

	 const expectedValue = rlp.decode(data.accountProof[data.accountProof.length - 1])[1];
	 const ind = 0;
	 const kkkey = '0x' + data.storageProof[ind].key.substring(2).padStart(64, '0');
	 const contractKey = '0x' + expandkey(web3.utils.soliditySha3(data.address));
	 const storageKey = '0x' + expandkey(web3.utils.soliditySha3(kkkey));
	 const valueHex = ethers.utils.hexlify(BigInt(data.storageProof[ind].value));
	 
	 const accountProof = {
		 expectedRoot: header.stateRoot,
		 key: contractKey,
		 //key: '0x' + expandkey(ethers.utils.solidityKeccak256(['address'],[data.address])),
		 proof: data.accountProof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: buffer2hex(expectedValue)
	 }


	 const storageProof = {
		 expectedRoot: data.storageHash,
		 key: storageKey,
		 //key: '0x' + expandkey(ethers.utils.solidityKeccak256(['address'],[kkkey])),
		 proof: data.storageProof[ind].proof,
		 keyIndex: 0,
		 proofIndex: 0,
		 expectedValue: valueHex,
	 }
	 console.log("prove data: ", valueHex);
	 
	 const provider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
	 const wallet = new ethers.Wallet(KEY_OWNER);

     const signer = wallet.connect(provider);
	 const bridge = new ethers.Contract(BRIDGE_MUMBAI, BridgeJSON, provider);
	 const score = new ethers.Contract(SCOREMUMBAI_ADDRESS, ScoreJSON, signer);

	 const proof = { header: header, accountProof: accountProof, storageProof: storageProof };
	 
	 
	 const proofTypes = [ 
			"tuple(bytes32 hash,bytes32 parentHash,bytes32 sha3Uncles,address miner,bytes32 stateRoot,bytes32 transactionsRoot,bytes32 receiptsRoot,bytes logsBloom,uint256 difficulty,uint256 number,uint256 gasLimit,uint256 gasUsed,uint256 timestamp,bytes extraData,bytes32 mixHash,uint64 nonce,uint256 totalDifficulty) header",
		 	"tuple(bytes32 expectedRoot ,bytes key,bytes[] proof,uint256 keyIndex,uint256 proofIndex,bytes expectedValue) accountProof",
		 	"tuple(bytes32 expectedRoot ,bytes key,bytes[] proof,uint256 keyIndex,uint256 proofIndex,bytes expectedValue) storageProof"];

 
	 const abiCoder = ethers.utils.defaultAbiCoder;
	 const proofData = abiCoder.encode(proofTypes, [header, accountProof, storageProof] );
	 //console.log("proofData", proofData);
     let check = await bridge.verify(proofData, data.address, data.storageProof[0].key, valueHex, 24 * 60 );
     
     let key = await bridge.getMapStorageKey(permalink, 0);
     console.log("key", key, data.storageProof[0].key);
     console.log("verify on Mumbai response: ", check);
     
     const tx = await score.syncScore(
			permalink,
			valueHex,
			proofData,
			data.address,
	 		24 * 60);

	console.log("TX sent: ", tx.hash);
	const receipt = await tx.wait(1);
	//console.log('Transaction receipt', receipt);
				  
};


async function getBlock(rpc, contract, needCheckpointed = false)
{
	 const provider = new ethers.providers.JsonRpcProvider(rpc);
	 const bridge = new ethers.Contract(contract, BridgeJSON, provider);
	 
     const events = await bridge.queryFilter('Blockhash');

     console.log("Found ", events.length, "Blockhash events");
     
     if( needCheckpointed == false ) return { 	number: events[events.length - 1].args.blocknumber, 
     								timestamp: events[events.length - 1].args.blocktimestamp,
     								hash: events[events.length - 1].args.blockhash	};
     
     const posClient = new POSClient();
     const maticprovider = new ethers.providers.JsonRpcProvider(RPC_MUMBAI);
	 const ethereumprovider = new ethers.providers.JsonRpcProvider(RPC_GOERLI);
	 const wallet = new ethers.Wallet(KEY_OWNER);
	 const address = wallet.address;
	 await posClient.init(
	 {
	  log: false,
      network: "testnet",
      version: "mumbai",
      parent: {
		  provider: new ethers.Wallet(KEY_OWNER, ethereumprovider),
		  defaultConfig: {
			from : address
		  }
	  },
	  child: {
		   provider: new ethers.Wallet(KEY_OWNER, maticprovider),
		   defaultConfig: {
			 from : address
		   }
	  }
    });
						
     let i = events.length - 1;
	 while( i >= 0)
	 {    
		  const txHash = events[i].transactionHash;
		  const isReady = await posClient.isCheckPointed(txHash);
		  console.log("Event ", i, " isCheckPointed: ", isReady);
		  if( isReady )
		  {
			  return { 	number: events[i].args.blocknumber, 
     					timestamp: events[i].args.blocktimestamp,
     					hash: events[i].args.blockhash	};
			  
			  break;		
		  } else i--; 
	 };

	return {number: 0, 
     		timestamp: 0,
     		hash: 0	};
}



async function awsproof(permalink)
{	

    console.log('Checking blockhash on Goerli... ');	
	const blockGoerli = await getBlock(RPC_MUMBAI, BRIDGE_MUMBAI); //(RPC_GOERLI, BRIDGE_GOERLI);
	console.log("Goerli block: ");
	let date = new Date(blockGoerli.timestamp*1000);
	console.log(JSON.stringify({number: parseInt(blockGoerli.number).toString(), 
								hash: blockGoerli.hash.toString(),
								timestamp: date.toUTCString() },
								(_, v) => typeof v === 'BigNumber' ? v.toString() : v,
								1));
	/*
	console.log('Checking blockhash on Mumbai... ');	
	const blockMumbai = await getBlock(RPC_MUMBAI, BRIDGE_MUMBAI, true);
	console.log("Mumbai block: ");
	date = new Date(blockMumbai.timestamp*1000);
	console.log(JSON.stringify({number: parseInt(blockMumbai.number).toString(), 
								hash: blockMumbai.hash.toString(),
								timestamp: date.toUTCString() },
								(_, v) => typeof v === 'BigNumber' ? v.toString() : v,
								1));

	*/
	let permalinkHex = BigInt(permalink).toString(16).padStart(64, '0');
	//console.log("ethproof: ", permalink, permalinkHex, permalinkHex.length);
	//while( permalinkHex.length < 64) permalinkHex = "0" + permalinkHex;
	
	// position of map versions is 0x00
	const key = "0x" + toHex(keccak256(hexToBytes(permalinkHex +
								 "0000000000000000000000000000000000000000000000000000000000000000"))).toString();
	const block = "0x" + parseInt(blockGoerli.number.toString()).toString(16);
   
	const data = {"jsonrpc":"2.0",
				  "method":"eth_getProof",
				  "params":[
						SCOREAWS_ADDRESS,
						[key],
						block],
				  "id":1 };
		  
	console.log("ethproof: ", data);

	const response = await axios.post(RPC_AWS_ENDPOINT, data);
	// console.log("response: ", response);
	
	
	const blockData = {"jsonrpc":"2.0",
				  		"method":"eth_getBlockByNumber",
				  		"params":[block, false],
				  		"id":1 };

	//console.log("block data: ", blockData);
	const rpcBlock = await axios.post(RPC_AWS_ENDPOINT, blockData);
	//console.log("block data: ", rpcBlock.data.result);
	
	
	let value = response.data.result.storageProof[0].value.toString();
	console.log("Value from AWS chain: ", value);
	//console.log("proof: ", response.data.result); //.result.storageProof[0]
	console.log("storageProof: ", response.data.result.storageProof[0]);
	
 	
 	const getAndVerify = new GetAndVerify(RPC_AWS_ENDPOINT);
 	
    let blockHash       = blockGoerli.hash;
    let accountAddress  = SCOREAWS_ADDRESS;
    let position        = key;
    
    try {	 		 

	   console.log("Verifying proof...");
	   let storageValue = await getAndVerify.storageAgainstBlockNumber(accountAddress, position, block, blockHash);
	   console.log("Value after verifying proof off-chain:", parseInt(storageValue.toString('hex')));

 	} catch (error) {
      console.error("catch", error);
    }

	console.log("Verifying proof on Goerli...");
	await prove(permalink, value, response.data.result, rpcBlock.data.result, blockGoerli.hash.toString());


};



module.exports = {
	awsproof
}