const { utils } = require("ethers");
const DEBUG="*";

require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require('hardhat-abi-exporter');



const defaultNetwork = "mumbai"; // "localhost";  "mumbai";
const { isAddress, getAddress, formatUnits, parseUnits } = utils;
const {KEY } = require('@list/config');
const  privateKey  = KEY;
//const { privateKey } = require('./private_deployer.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


async function addr(ethers, addr) {
  if (isAddress(addr)) {
    return getAddress(addr);
  }
  const accounts = await ethers.provider.listAccounts();
  if (accounts[addr] !== undefined) {
    return accounts[addr];
  }
  throw `Could not normalize address: ${addr}`;
}

task("balance", "Prints an account's balance")
  .addPositionalParam("account", "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(
      await addr(ethers, taskArgs.account)
    );
    console.log(formatUnits(balance, "ether"), "ETH");
  });


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork,
    networks: {
    localhost: {
      url: "http://localhost:8545",
      gasPrice: 1000000000,
      accounts: [privateKey],
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/o1zy9B4CvgTsH_dHr9nTia4ZTPypCpR0",
      //"https://rpc-mainnet.maticvigil.com/",
      chainId: 4,
      gas:"auto",
      gasMultiplier:2,
      accounts: [privateKey]
    },

    polygon: {
      url: "",
      //"https://rpc-mainnet.maticvigil.com/",
      chainId: 137,
      gas:"auto",
      gasMultiplier:2,
      forwarder:  0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d,
      accounts: [privateKey]
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/BwVbde2aMs_mNN8KLFIZl6037vvZMAnH", //"https://rpc-mumbai.maticvigil.com", 
      gas:"auto",
      gasMultiplier:2,
      forwarder:  0x4d4581c01A457925410cd3877d17b2fd4553b2C5,
      accounts: [privateKey]
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "FQ1NYZXPQIICKE7U41VSRB7TPKZJQKI7SH" //"FQ1NYZXPQIICKE7U41VSRB7TPKZJQKI7SH"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      } 
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  contractSizer: {
  	alphaSort: true,
  	disambiguatePaths: false,
  	runOnCompile: true,
  	strict: true,
  },
  abiExporter: {
	  path: './abi',
	  clear: true,
	  flat: false,
	  only: [],
	  spacing: 2
  }
};
