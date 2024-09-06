const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const SwapRouter02 = await ethers.getContractFactory("SwapRouter02");

  // Deploy contract
  const swapRouter02 = await SwapRouter02.deploy(
    // Pair Factory V2 (on goerli temporary use uniswap)
    contracts.xSwapV2Factory,
    // Pool Factory V3
    contracts.xSwapV3Factory,
    // Position manager contract
    contracts.nonfungiblePositionManager,
    // WETH address
    contracts.weth
  );
  await swapRouter02.deployed();
  saveContract(network, "swapRouter02", swapRouter02.address);
  console.log("SwapRouter02 contract deployed to:", swapRouter02.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: swapRouter02.address,
    constructorArguments: [
      contracts.xSwapV2Factory,
      contracts.xSwapV3Factory,
      contracts.nonfungiblePositionManager,
      contracts.weth,
    ],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
