const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const NFTDescriptor = await hre.ethers.getContractFactory("NFTDescriptor");

  // Deploy contract
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();
  saveContract(network, "nftDescriptor", nftDescriptor.address);
  console.log("NFT Descriptor library deployed to:", nftDescriptor.address);

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: nftDescriptor.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
