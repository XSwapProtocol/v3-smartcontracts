const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const MixedRouteQuoterV1 = await ethers.getContractFactory(
    "MixedRouteQuoterV1"
  );

  // Deploy contract
  const mixedRouteQuoterV1 = await MixedRouteQuoterV1.deploy(
    // Pool Factory V3
    contracts.xSwapV3Factory,
    // Pair Factory V2 (on goerli temporary use uniswap)
    contracts.xSwapV2Factory,
    // WETH address
    contracts.weth
  );
  await mixedRouteQuoterV1.deployed();
  saveContract(network, "mixedRouteQuoterV1", mixedRouteQuoterV1.address);
  console.log(
    "Mixed Route Quoter V1 contract deployed to:",
    mixedRouteQuoterV1.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: mixedRouteQuoterV1.address,
    constructorArguments: [
      contracts.xSwapV3Factory,
      contracts.xSwapV2Factory,
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
