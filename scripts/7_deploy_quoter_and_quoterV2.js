const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const Quoter = await ethers.getContractFactory("Quoter");
  const QuoterV2 = await ethers.getContractFactory("QuoterV2");

  // Deploy contract quoter
  const quoter = await Quoter.deploy(
    // Pool Factory
    contracts.xSwapV3Factory,
    // WETH address
    contracts.weth
  );
  await quoter.deployed();
  saveContract(network, "quoter", quoter.address);
  console.log("Quoter contract deployed to:", quoter.address);

  // Deploy contract quoterV2
  const quoterV2 = await QuoterV2.deploy(
    // Pool Factory
    contracts.xSwapV3Factory,
    // WETH address
    contracts.weth
  );
  await quoterV2.deployed();
  saveContract(network, "quoterV2", quoterV2.address);
  console.log("Quoter V2 contract deployed to:", quoterV2.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: quoter.address,
    constructorArguments: [contracts.xSwapV3Factory, contracts.weth],
  });

  await hre.run("verify:verify", {
    address: quoterV2.address,
    constructorArguments: [contracts.xSwapV3Factory, contracts.weth],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
