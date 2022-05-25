
// scripts/deploylist.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const List = await ethers.getContractFactory("List");
  console.log("Deploying List...");

  const list = await upgrades.deployProxy(List, ["0x613c90582B1668cA6BD31A42803c9e37596a836B", "0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515"]);
  console.log("Deploying List - waiting...");	
  await list.deployed();
  console.log("List deployed to:", list.address);
}

main();
