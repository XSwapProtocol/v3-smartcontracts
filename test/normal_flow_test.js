const { BigNumber } = require("ethers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployTestContract } = require("./helper/deploy_test_contract");
const { encodePriceSqrt } = require("./helper/encodePriceSqrt");
const { computePoolAddress } = require("./helper/computePoolAddress");
const { getMinTick, getMaxTick } = require("./helper/ticks");

const {
  abi,
} = require("../artifacts/contracts/core/interfaces/IXSwapPool.sol/IXSwapPool.json");

describe("Running test", function () {
  let dai;
  let weth;
  let wbtc;
  let testERC20;
  let xSwapFactory;
  let nftDescriptor;
  let nonfungiblePositionDescriptor;
  let nonfungiblePositionManager;
  let swapRouter;
  let admin;
  let bob;
  let alice;
  before(async function () {
    [admin, bob, alice] = await ethers.getSigners();
    [
      dai,
      weth,
      wbtc,
      testERC20,
      xSwapFactory,
      nftDescriptor,
      nonfungiblePositionDescriptor,
      nonfungiblePositionManager,
      swapRouter,
    ] = await deployTestContract(admin);
  });
  it("Should create pool, add liquidity and execute swap successfully", async function () {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const expectedAddress = computePoolAddress(
      xSwapFactory.address,
      [dai.address, wbtc.address],
      3000
    );
    const code = await admin.provider.getCode(expectedAddress);
    expect(code).to.eq("0x");
    // await nonfungiblePositionManager.createAndInitializePoolIfNecessary(
    //   dai.address,
    //   wbtc.address,
    //   3000,
    //   encodePriceSqrt(1, 20000)
    // );
    await xSwapFactory.createPool(dai.address, wbtc.address, 3000);
    const pool = new ethers.Contract(expectedAddress, abi, admin);

    await pool.initialize(encodePriceSqrt(1, 20000));
    const codeAfter = await admin.provider.getCode(expectedAddress);
    expect(codeAfter).to.not.eq("0x");
    console.log("Pool created!");
    let mintParams;
    if (dai.address.toLowerCase() < wbtc.address.toLowerCase()) {
      mintParams = {
        token0: dai.address,
        token1: wbtc.address,
        fee: 3000,
        tickLower: getMinTick(3000),
        tickUpper: getMaxTick(3000),
        amount0Desired: ethers.utils.parseEther("20000"),
        amount1Desired: "100000000",
        amount0Min: 0,
        amount1Min: 0,
        recipient: admin.address,
        deadline: block.timestamp + 120,
      };
    } else {
      mintParams = {
        token0: wbtc.address,
        token1: dai.address,
        fee: 3000,
        tickLower: getMinTick(3000),
        tickUpper: getMaxTick(3000),
        amount0Desired: "100000000",
        amount1Desired: ethers.utils.parseEther("20000"),
        amount0Min: 0,
        amount1Min: 0,
        recipient: admin.address,
        deadline: block.timestamp + 120,
      };
    }
    await nonfungiblePositionManager.mint(mintParams);
    console.log("Mint succeed");

    const swapParams = {
      tokenIn: dai.address,
      tokenOut: wbtc.address,
      fee: 3000,
      recipient: admin.address,
      deadline: block.timestamp + 120,
      amountIn: 170000,
      amountOutMinimum: 100,
      sqrtPriceLimitX96:
        dai.address.toLowerCase() < wbtc.address.toLowerCase()
          ? BigNumber.from("4295128740")
          : BigNumber.from("1461446703485210103287273052203988822378723970341"),
    };
    await swapRouter.exactInputSingle(swapParams);
  });
});
