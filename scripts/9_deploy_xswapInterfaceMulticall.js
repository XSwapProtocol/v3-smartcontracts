const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const XswapInterfaceMulticall = await ethers.getContractFactory(
    "XswapInterfaceMulticall"
  );

  // Deploy contract
  const xswapInterfaceMulticall = await XswapInterfaceMulticall.deploy();
  await xswapInterfaceMulticall.deployed();
  saveContract(
    network,
    "xswapInterfaceMulticall",
    xswapInterfaceMulticall.address
  );
  console.log(
    "Xswap Interface Multicall contract deployed to:",
    xswapInterfaceMulticall.address
  );

  console.log("Completed!");

  await hre.run("verify:verify", {
    address: xswapInterfaceMulticall.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
