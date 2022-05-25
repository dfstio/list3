
// scripts/deploylist.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const List = await ethers.getContractFactory("List");
  console.log("Deploying List...");

  const list = await upgrades.deployProxy(List, ["0x613c90582B1668cA6BD31A42803c9e37596a836B", //add
  												 "0xcE46ffc2f53B9343114b0fD2583ab3C10ce46BE2", //update
  												 "0x62Bfb94b472044F09125a7662C81FEf36D22D305", //revoke
  												 "0x25c593AAeaA06a41881186a8cE174C9AB0ec537e", //addrevoked
  												 "0xb6514E22ef505d8bD1AF6A39cB0FB578c9241515"]); //permalink
  console.log("Deploying List - waiting...");	
  await list.deployed();
  console.log("List deployed to:", list.address);
}

main();
