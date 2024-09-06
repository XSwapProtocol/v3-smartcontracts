const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const deploymentParams = {
    permit2: contracts.permit2,
    weth9: contracts.weth,
    seaport: contracts.unsupportedContract,
    seaportV1_4: contracts.unsupportedContract,
    openseaConduit: contracts.unsupportedContract,
    nftxZap: contracts.unsupportedContract,
    x2y2: contracts.unsupportedContract,
    foundation: contracts.unsupportedContract,
    sudoswap: contracts.unsupportedContract,
    elementMarket: contracts.unsupportedContract,
    nft20Zap: contracts.unsupportedContract,
    cryptopunks: contracts.unsupportedContract,
    looksRare: contracts.unsupportedContract,
    routerRewardsDistributor: contracts.unsupportedContract,
    looksRareRewardsDistributor: contracts.unsupportedContract,
    looksRareToken: contracts.unsupportedContract,
    v2Factory: contracts.xSwapV2Factory,
    v3Factory: contracts.xSwapV3Factory,
    pairInitCodeHash: contracts.pairInitCodeHash,
    poolInitCodeHash: contracts.poolInitCodeHash,
    paymentRecipient: contracts.unsupportedContract,
    paymentAmountBips: 0,
  };

  const UniversalRouter = await ethers.getContractFactory("UniversalRouter");

  // Deploy contract
  const universalRouter = await UniversalRouter.deploy(deploymentParams);
  await universalRouter.deployed();
  saveContract(network, "universalRouter", universalRouter.address);
  console.log(
    "Universal Router contract deployed to:",
    universalRouter.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: universalRouter.address,
    constructorArguments: [deploymentParams],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
