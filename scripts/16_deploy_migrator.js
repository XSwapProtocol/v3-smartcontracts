const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const V3Migrator = await ethers.getContractFactory("V3Migrator");

  // Deploy contract
  const v3Migrator = await V3Migrator.deploy(
    // Pool Factory V3
    contracts.xSwapV3Factory,
    // WETH address
    contracts.weth,
    // Position manager contract
    contracts.nonfungiblePositionManager
  );
  await v3Migrator.deployed();
  saveContract(network, "v3Migrator", v3Migrator.address);
  console.log("V3Migrator contract deployed to:", v3Migrator.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: v3Migrator.address,
    constructorArguments: [
      contracts.xSwapV3Factory,
      contracts.weth,
      contracts.nonfungiblePositionManager,
    ],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
