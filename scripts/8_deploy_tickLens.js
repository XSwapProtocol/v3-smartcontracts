const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const TickLens = await ethers.getContractFactory("TickLens");

  // Deploy contract
  const tickLens = await TickLens.deploy();
  await tickLens.deployed();
  saveContract(network, "tickLens", tickLens.address);
  console.log("Tick Lens contract deployed to:", tickLens.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: tickLens.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
