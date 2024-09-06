const hre = require("hardhat");
const { ethers } = hre;
const { getContracts, saveContract } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const feeTakersParam = {
    firstTaker: "0xE94219d3368C061618eF370E108b3795F5081C70",
    firstTakerClaimRate: 4000,
    secondTaker: "0xE94219d3368C061618eF370E108b3795F5081C70",
    secondTakerClaimRate: 3000,
    thirdTaker: "0xE94219d3368C061618eF370E108b3795F5081C70",
    thirdTakerClaimRate: 3000,
  };

  const XSwapTreasury = await hre.ethers.getContractFactory("XSwapTreasury");
 
  // Deploy contract
  const xSwapTreasury = await XSwapTreasury.deploy(
    contracts.xSwapV3Factory,
    feeTakersParam
  );
  await xSwapTreasury.deployed();
  saveContract(network, "xSwapTreasury", xSwapTreasury.address);
  console.log("XSwap Treasury  contract deployed to:", xSwapTreasury.address);

  console.log("Completed!");

  // Set treasury address on XSwap Factory
  const XSwapFactory = await hre.ethers.getContractFactory("XSwapFactory");
  const xSwapFactory = XSwapFactory.attach(contracts.xSwapV3Factory);
  await xSwapFactory.setTreasury(contracts.xSwapTreasury);

  console.log("Set Treasury succeed!");

  await hre.run("verify:verify", {
    address: xSwapTreasury.address,
    constructorArguments: [contracts.xSwapV3Factory, feeTakersParam],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
