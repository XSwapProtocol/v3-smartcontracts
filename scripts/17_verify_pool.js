const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  await hre.run("verify:verify", {
    address: "0x08c1751b4183311bf54A1f97e9FbF9CE3B8D43a3", // Pool address
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
