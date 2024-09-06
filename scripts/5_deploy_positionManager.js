const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const NonfungiblePositionManager = await hre.ethers.getContractFactory(
    "NonfungiblePositionManager"
  );

  // Deploy contract
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    // Pool Factory
    contracts.xSwapV3Factory,
    // WETH address
    contracts.weth,
    // Nonfungible Token Position Descriptor
    contracts.nonfungiblePositionDescriptor
  );
  await nonfungiblePositionManager.deployed();
  saveContract(
    network,
    "nonfungiblePositionManager",
    nonfungiblePositionManager.address
  );
  console.log(
    "Nonfungible Position Manager contract deployed to:",
    nonfungiblePositionManager.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: nonfungiblePositionManager.address,
    constructorArguments: [
      contracts.xSwapV3Factory,
      contracts.weth,
      contracts.nonfungiblePositionDescriptor,
    ],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
