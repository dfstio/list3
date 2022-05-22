// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const accounts = await hre.ethers.getSigners();
  const owner = accounts[0].address;
  console.log("Deployer address:", owner);
  // We get the contract to deploy
  const Verifier = await hre.ethers.getContractFactory("ListHash");
  const verifier = await Verifier.deploy("0x2890bA17EfE978480615e330ecB65333b880928e", "0x572aC98bDea8950f348d2C66945d4E5312B35bbe");

  await verifier.deployed();

  console.log("ListHash deployed to:", verifier.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
