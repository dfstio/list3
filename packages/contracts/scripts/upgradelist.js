
// scripts/upgrade.js
const { ethers, upgrades } = require("hardhat");
const CONTRACT_ADDRESS = "0x44A8fBBa729633d0a0348f078A99edBF34607A8D";

async function main() {
  const ListUpgrade = await ethers.getContractFactory("List");
  const list = await upgrades.prepareUpgrade(CONTRACT_ADDRESS, List);
  console.log("List upgrade deployed to", list);
}

main();
