const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const Permit2 = await ethers.getContractFactory("Permit2");

  // Deploy contract
  const permit2 = await Permit2.deploy();
  await permit2.deployed();
  saveContract(network, "permit2", permit2.address);
  console.log("Permit2 contract deployed to:", permit2.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: permit2.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
