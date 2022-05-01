
// scripts/deploylist.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const List = await ethers.getContractFactory("List");
  console.log("Deploying List...");

  const list = await upgrades.deployProxy(List);
  console.log("Deploying List - waiting...");	
  await list.deployed();
  console.log("List deployed to:", list.address);
}

main();
