const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const UnsupportedContract = await ethers.getContractFactory(
    "UnsupportedProtocol"
  );

  // Deploy contract
  const unsupportedContract = await UnsupportedContract.deploy();
  await unsupportedContract.deployed();
  saveContract(network, "unsupportedContract", unsupportedContract.address);
  console.log(
    "Unsupported Protocol contract deployed to:",
    unsupportedContract.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: unsupportedContract.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
