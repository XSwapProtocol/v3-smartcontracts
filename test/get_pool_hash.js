const { ethers } = require("hardhat");

describe("Get pool hash", function () {
  let poolHash;
  before(async function () {
    const PoolHash = await hre.ethers.getContractFactory("GetPoolByteCode");

    poolHash = await PoolHash.deploy();
    await poolHash.deployed();
  });
  it("Should get pool hash", async function () {
    console.log("Deployed");
    await poolHash.getPoolCodeHash();
    const poolCodeHash = await poolHash.poolCodeHash();
    console.log(poolCodeHash);
  });
});
