const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const PositionDescriptor = await hre.ethers.getContractFactory(
    "NonfungibleTokenPositionDescriptor",
    {
      libraries: {
        NFTDescriptor: contracts.nftDescriptor,
      },
    }
  );

  // Deploy contract
  const nonfungiblePositionDescriptor = await PositionDescriptor.deploy(
    // WETH address
    contracts.weth,
    // 'ETH' as a bytes32 string
    contracts.nativeCurrencyLabelBytes
  );
  await nonfungiblePositionDescriptor.deployed();
  saveContract(
    network,
    "nonfungiblePositionDescriptor",
    nonfungiblePositionDescriptor.address
  );
  console.log(
    "Nonfungible Token Position Descriptor contract deployed to:",
    nonfungiblePositionDescriptor.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: "0x5951645eD7221dE2bb70a97c5bA54E3942FDaC7e",
    constructorArguments: [contracts.weth, contracts.nativeCurrencyLabelBytes],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
