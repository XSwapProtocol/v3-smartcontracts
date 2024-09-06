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
  let nonfungiblePositionManager;
  let swapRouter;
  let admin;
  let bob;
  let alice;
  let liquidityAmountsTest;
  let block;
  let expectedAddress;
  before(async function () {
    [admin, bob, alice] = await ethers.getSigners();
    [
      dai,
      weth,
      wbtc,
      testERC20,
      xSwapFactory,
      ,
      ,
      nonfungiblePositionManager,
      swapRouter,
      liquidityAmount,
    ] = await deployTestContract(admin);
    const blockNum = await ethers.provider.getBlockNumber();
    block = await ethers.provider.getBlock(blockNum);
    expectedAddress = computePoolAddress(
      xSwapFactory.address,
      [dai.address, testERC20.address],
      3000
    );
  });

  describe("#mint", async function () {
    let mintParams;
    let token1st;
    let token2nd;
    let amount0Desired;
    let amount1Desired;

    it("fails if pool does not exist", async () => {
      await expect(
        nonfungiblePositionManager.mint({
          token0: dai.address,
          token1: testERC20.address,
          fee: 300,
          tickLower: getMinTick(3000),
          tickUpper: getMaxTick(3000),
          amount0Desired: 100,
          amount1Desired: 100,
          amount0Min: 0,
          amount1Min: 0,
          recipient: admin.address,
          deadline: 1,
        })
      ).to.be.reverted;
    });

    it("fails if pool created but not initialize", async () => {
      await xSwapFactory.createPool(weth.address, testERC20.address, 3000);
      const pool_test = new ethers.Contract(expectedAddress, abi, admin);
      // await pool.initialize(encodePriceSqrt(1, 1500));

      console.log("Pool created!");

      if (weth.address.toLowerCase() < testERC20.address.toLowerCase()) {
        token1st = weth.address;
        token2nd = testERC20.address;
        amount0Desired = ethers.utils.parseEther("1500000");
        amount1Desired = ethers.utils.parseEther("1000");
      } else {
        token1st = testERC20.address;
        token2nd = weth.address;
        amount0Desired = ethers.utils.parseEther("1000");
        amount1Desired = ethers.utils.parseEther("1500000");
      }
      mintParams = {
        token0: token1st,
        token1: token2nd,
        fee: 3000,
        tickLower: getMinTick(3000),
        tickUpper: getMaxTick(3000),
        amount0Desired: amount0Desired,
        amount1Desired: amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        recipient: admin.address,
        deadline: block.timestamp + 120,
      };
      await expect(nonfungiblePositionManager.mint(mintParams)).to.be.reverted;
    });

    it("create pool and mint successfully", async () => {
      const code = await admin.provider.getCode(expectedAddress);
      expect(code).to.eq("0x");
      await xSwapFactory.createPool(dai.address, testERC20.address, 3000);
      const pool = new ethers.Contract(expectedAddress, abi, admin);
      await pool.initialize(encodePriceSqrt(1, 1500));
      const codeAfter = await admin.provider.getCode(expectedAddress);
      expect(codeAfter).to.not.eq("0x");
      console.log("Pool created!");

      if (dai.address.toLowerCase() < testERC20.address.toLowerCase()) {
        token1st = dai.address;
        token2nd = testERC20.address;
        amount0Desired = ethers.utils.parseEther("15");
        amount1Desired = ethers.utils.parseEther("22500");
      } else {
        token1st = testERC20.address;
        token2nd = dai.address;
        amount0Desired = ethers.utils.parseEther("22500");
        amount1Desired = ethers.utils.parseEther("15");
      }

      mintParams = {
        token0: token1st,
        token1: token2nd,
        fee: 3000,
        tickLower: getMinTick(3000),
        tickUpper: getMaxTick(3000),
        amount0Desired: amount0Desired,
        amount1Desired: amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        recipient: admin.address,
        deadline: block.timestamp + 120,
      };
      const mint_result = await nonfungiblePositionManager.mint(mintParams);
      console.log("Mint succeed");
      const a = await mint_result.wait();
      const event = a.events.find((it) => {
        return it.event === "IncreaseLiquidity";
      });

      const tokenId = event.args.tokenId.toNumber();
      const { fee, token0, token1, liquidity } =
        await nonfungiblePositionManager.positions(tokenId);

      const amount0 = event.args.amount0;
      const amount1 = event.args.amount1;

      expect(amount0 / amount0Desired).to.gt(0.95);
      expect(amount0 / amount0Desired).to.lte(1);

      expect(amount1 / amount1Desired).to.gt(0.95);
      expect(amount1 / amount1Desired).to.lte(1);

      expect(token0).to.eq(token1st);
      expect(token1).to.eq(token2nd);
      expect(fee).to.eq(3000);
    });

    it("fails if pool already created", async () => {
      const code = await admin.provider.getCode(expectedAddress);

      await expect(
        xSwapFactory.createPool(dai.address, testERC20.address, 3000)
      ).to.be.reverted;
    });

    it("fails if cannot transfer", async () => {
      await dai.approve(nonfungiblePositionManager.address, 0);
      await expect(
        nonfungiblePositionManager.mint({
          token0: token1st,
          token1: token2nd,
          fee: 3000,
          tickLower: getMinTick(3000),
          tickUpper: getMaxTick(3000),
          amount0Desired: amount0Desired,
          amount1Desired: amount1Desired,
          amount0Min: 0,
          amount1Min: 0,
          recipient: admin.address,
          deadline: block.timestamp + 120,
        })
      ).to.be.revertedWith("STF");
    });
  });

  describe("#initialize", () => {
    it("Should be reverted", async function () {
      await expect(
        nonfungiblePositionManager.positions("0")
      ).to.be.revertedWith("Invalid token ID");
    });

    it("Should fails if already initialized", async function () {
      const expectedAddress = computePoolAddress(
        xSwapFactory.address,
        [wbtc.address, testERC20.address],
        3000
      );
      await xSwapFactory.createPool(wbtc.address, testERC20.address, 3000);
      const pool = new ethers.Contract(expectedAddress, abi, admin);

      await pool.initialize(encodePriceSqrt(1, 1));
      await expect(pool.initialize(encodePriceSqrt(1, 1))).to.be.reverted;
    });
  });
});
