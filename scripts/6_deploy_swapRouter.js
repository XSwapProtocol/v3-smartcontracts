const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");

  // Deploy contract
  const swapRouter = await SwapRouter.deploy(
    // Pool Factory
    contracts.xSwapV3Factory,
    // WETH address
    contracts.weth
  );
  await swapRouter.deployed();
  saveContract(network, "swapRouter", swapRouter.address);
  console.log("Swap Router contract deployed to:", swapRouter.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: swapRouter.address,
    constructorArguments: [contracts.xSwapV3Factory, contracts.weth],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
