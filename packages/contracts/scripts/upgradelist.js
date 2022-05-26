
// scripts/upgrade.js
const { ethers, upgrades } = require("hardhat");
const { LIST_CONTRACT_ADDRESS } = require('@list/config');


async function main() {
  const ListUpgrade = await ethers.getContractFactory("List");
//  const list = await upgrades.prepareUpgrade(LIST_CONTRACT_ADDRESS, ListUpgrade);
  const list = await upgrades.upgradeProxy(LIST_CONTRACT_ADDRESS, ListUpgrade);
  console.log("List upgrade deployed to", list);
}

main();
