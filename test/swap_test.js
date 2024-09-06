const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { deployTestContract } = require("./helper/deploy_test_contract");
const { encodePriceSqrt } = require("./helper/encodePriceSqrt");
const { expandToDecimals } = require("./helper/expandToDecimals");
const { encodePath } = require("./helper/encodePath");

describe("Swap testing", function () {
  let dai;
  let weth;
  let wbtc;
  let xSwapFactory;
  let nonfungiblePositionManager;
  let swapRouter;
  let admin;
  let bob;
  let alice;
  let block;
  let firstToken;
  let secondToken;
  let wbtcBefore;
  let daiBefore;

  class Token {
    constructor(address, price, decimals) {
      this.address = address;
      this.price = price;
      this.decimals = decimals;
    }
  }
  before(async function () {
    [admin, bob, alice] = await ethers.getSigners();
    [
      dai,
      weth,
      wbtc,
      ,
      xSwapFactory,
      ,
      ,
      nonfungiblePositionManager,
      swapRouter,
    ] = await deployTestContract(admin);
    const blockNum = await ethers.provider.getBlockNumber();
    block = await ethers.provider.getBlock(blockNum);

    await xSwapFactory.createPool(dai.address, wbtc.address, 3000);
    await xSwapFactory.createPool(dai.address, weth.address, 3000);

    const daiDecimals = await dai.decimals();
    const wbtcDecimals = await wbtc.decimals();
    const wethDecimals = await weth.decimals();

    // Create & initiliaze pool DAI & WBTC
    const poolAddress = await xSwapFactory.getPool(
      dai.address,
      wbtc.address,
      3000
    );
    const pool = await hre.ethers.getContractAt("XSwapPool", poolAddress);
    const isRightOrder =
      (await pool.token0()).toLowerCase() === dai.address.toLowerCase();

    firstToken = isRightOrder
      ? new Token(dai.address, 1, daiDecimals)
      : new Token(wbtc.address, 28000, wbtcDecimals);

    secondToken = isRightOrder
      ? new Token(wbtc.address, 28000, wbtcDecimals)
      : new Token(dai.address, 1, daiDecimals);

    await pool.initialize(encodePriceSqrt(secondToken.price, firstToken.price));

    const tokenOutRatio = secondToken.price / firstToken.price;

    // Start minting
    const mintParams = {
      token0: firstToken.address,
      token1: secondToken.address,
      fee: 3000,
      tickLower: 102360,
      tickUpper: 102420,
      amount0Desired: expandToDecimals(
        tokenOutRatio * 1000,
        firstToken.decimals
      ),
      amount1Desired: expandToDecimals(1000, secondToken.decimals),
      amount0Min: 0,
      amount1Min: 0,
      recipient: admin.address,
      deadline: block.timestamp + 120,
    };

    await nonfungiblePositionManager.mint(mintParams);

    // Create & initiliaze pool DAI & WETH
    const poolAddressB = await xSwapFactory.getPool(
      dai.address,
      weth.address,
      3000
    );
    const poolB = await hre.ethers.getContractAt("XSwapPool", poolAddressB);

    firstTokenB = isRightOrder
      ? new Token(dai.address, 1, daiDecimals)
      : new Token(weth.address, 1900, wethDecimals);

    secondTokenB = isRightOrder
      ? new Token(weth.address, 1900, wethDecimals)
      : new Token(dai.address, 1, daiDecimals);

    await poolB.initialize(
      encodePriceSqrt(secondTokenB.price, firstTokenB.price)
    );

    const tokenBOutRatio = secondTokenB.price / firstTokenB.price;

    // Start minting
    const mintParamsB = {
      token0: firstTokenB.address,
      token1: secondTokenB.address,
      fee: 3000,
      tickLower: 102360,
      tickUpper: 102420,
      amount0Desired: expandToDecimals(
        tokenBOutRatio * 1000,
        firstTokenB.decimals
      ),
      amount1Desired: expandToDecimals(1000, secondTokenB.decimals),
      amount0Min: 0,
      amount1Min: 0,
      recipient: admin.address,
      deadline: block.timestamp + 120,
    };

    await nonfungiblePositionManager.mint(mintParamsB);

    wbtcBefore = await wbtc.balanceOf(admin.address);
    daiBefore = await dai.balanceOf(admin.address);
  });

  describe("Swap exact input / output single pool", () => {
    it("Should execute swap exact input", async function () {
      const exactInputParams = {
        path: encodePath([dai.address, wbtc.address], [3000]),
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountIn: 100000,
        amountOutMinimum: 0,
      };

      const exactInputStatic = await swapRouter.callStatic.exactInput(
        exactInputParams
      );
      await swapRouter.exactInput(exactInputParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(wbtcBefore).add(exactInputStatic)).to.eq(wbtcAfter);
      expect(BigNumber.from(daiAfter).add(100000)).to.eq(daiBefore);

      wbtcBefore = wbtcAfter;
      daiBefore = daiAfter;
    });

    it("Should execute swap exact output", async function () {
      const exactOutputParams = {
        path: encodePath([dai.address, wbtc.address], [3000]),
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountOut: 1000,
        amountInMaximum: 100000000000000,
      };

      const exactOutputStatic = await swapRouter.callStatic.exactOutput(
        exactOutputParams
      );
      await swapRouter.exactOutput(exactOutputParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(daiBefore).add(1000)).to.eq(daiAfter);
      expect(BigNumber.from(wbtcAfter).add(exactOutputStatic)).to.eq(
        wbtcBefore
      );

      wbtcBefore = wbtcAfter;
      daiBefore = daiAfter;
    });
  });

  describe("Swap exact input / output multiple pools", () => {
    it("Should execute swap exact input", async function () {
      const exactInputParams = {
        path: encodePath(
          [dai.address, weth.address, wbtc.address],
          [3000, 3000]
        ),
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountIn: 100000,
        amountOutMinimum: 0,
      };

      const exactInputStatic = await swapRouter.callStatic.exactInput(
        exactInputParams
      );
      await swapRouter.exactInput(exactInputParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(wbtcBefore).add(exactInputStatic)).to.eq(wbtcAfter);

      wbtcBefore = wbtcAfter;
      daiBefore = daiAfter;
    });

    it("Should execute swap exact output", async function () {
      const exactOutputParams = {
        path: encodePath(
          [dai.address, weth.address, wbtc.address],
          [3000, 3000]
        ),
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountOut: 1000,
        amountInMaximum: 100000000000000,
      };

      const exactOutputStatic = await swapRouter.callStatic.exactOutput(
        exactOutputParams
      );
      await swapRouter.exactOutput(exactOutputParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(daiBefore).add(1000)).to.eq(daiAfter);
      expect(BigNumber.from(wbtcAfter).add(exactOutputStatic)).to.eq(
        wbtcBefore
      );

      wbtcBefore = wbtcAfter;
      daiBefore = daiAfter;
    });
  });

  describe("Swap exact input / output single", () => {
    it("Should execute swap exact input single", async function () {
      const exactInputSingleParams = {
        tokenIn: dai.address,
        tokenOut: wbtc.address,
        fee: 3000,
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountIn: 100000,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };

      const exactInputSingleStatic =
        await swapRouter.callStatic.exactInputSingle(exactInputSingleParams);
      await swapRouter.exactInputSingle(exactInputSingleParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(wbtcBefore).add(exactInputSingleStatic)).to.eq(
        wbtcAfter
      );

      wbtcBefore = wbtcAfter;
      daiBefore = daiAfter;
    });

    it("Should execute swap exact output single", async function () {
      const exactOutputSingleParams = {
        tokenIn: wbtc.address,
        tokenOut: dai.address,
        fee: 3000,
        recipient: admin.address,
        deadline: block.timestamp + 100,
        amountOut: 1000,
        amountInMaximum: 100000000000000,
        sqrtPriceLimitX96: 0,
      };

      const exactOutputSingleStatic =
        await swapRouter.callStatic.exactOutputSingle(exactOutputSingleParams);
      await swapRouter.exactOutputSingle(exactOutputSingleParams);
      const wbtcAfter = await wbtc.balanceOf(admin.address);
      const daiAfter = await dai.balanceOf(admin.address);

      expect(BigNumber.from(daiBefore).add(1000)).to.eq(daiAfter);
      expect(BigNumber.from(wbtcAfter).add(exactOutputSingleStatic)).to.eq(
        wbtcBefore
      );
    });
  });
});
