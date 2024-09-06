const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const XSwapV3Factory = await hre.ethers.getContractFactory("XSwapFactory");

  // Deploy contract
  const xSwapV3Factory = await XSwapV3Factory.deploy();
  await xSwapV3Factory.deployed();
  saveContract(network, "xSwapV3Factory", xSwapV3Factory.address);
  console.log("XSwap Factory V3 contract deployed to:", xSwapV3Factory.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: xSwapV3Factory.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
