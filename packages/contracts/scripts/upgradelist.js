
// scripts/upgrade.js
const { ethers, upgrades } = require("hardhat");
const { CONTRACT_ADDRESS } = require('@list/config');


async function main() {
  const ListUpgrade = await ethers.getContractFactory("List");
  const list = await upgrades.prepareUpgrade(CONTRACT_ADDRESS, ListUpgrade);
  console.log("List upgrade deployed to", list);
}

main();
