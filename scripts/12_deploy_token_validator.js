const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const TokenValidator = await ethers.getContractFactory("TokenValidator");

  // Deploy contract
  const tokenValidator = await TokenValidator.deploy(
    // Pair Factory V2 (on goerli temporary use uniswap)
    contracts.xSwapV2Factory,
    // Position manager contract
    contracts.nonfungiblePositionManager
  );
  await tokenValidator.deployed();
  saveContract(network, "tokenValidator", tokenValidator.address);
  console.log("Token Validator contract deployed to:", tokenValidator.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: tokenValidator.address,
    constructorArguments: [
      contracts.xSwapV2Factory,
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
