const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployTestContract } = require("./helper/deploy_test_contract");
const { encodePriceSqrt } = require("./helper/encodePriceSqrt");
const { expandToDecimals } = require("./helper/expandToDecimals");

describe("Running test", function () {
  let dai;
  let testERC20;
  let xSwapFactory;
  let nonfungiblePositionManager;
  let admin;
  let bob;
  let alice;
  let block;
  let tokenId;
  let amountIn;
  let feeTier;
  let feeProtocol;

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
      ,
      wbtc,
      testERC20,
      xSwapFactory,
      ,
      ,
      nonfungiblePositionManager,
      swapRouter,
    ] = await deployTestContract(admin);

    const blockNum = await ethers.provider.getBlockNumber();
    block = await ethers.provider.getBlock(blockNum);

    await xSwapFactory.createPool(dai.address, wbtc.address, 3000);

    const daiDecimals = await dai.decimals();
    const wbtcDecimals = await wbtc.decimals();

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

    const mint_result = await nonfungiblePositionManager.mint(mintParams);

    console.log("Mint succeed");

    // swap
    amountIn = 100000;
    feeTier = 0.003;
    feeProtocol = 0.1;

    const exactInputSingleParams = {
      tokenIn: dai.address,
      tokenOut: wbtc.address,
      fee: 3000,
      recipient: admin.address,
      deadline: block.timestamp + 100,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    await swapRouter.exactInputSingle(exactInputSingleParams);

    // tokenId
    const mint_result_params = await mint_result.wait();
    const event = mint_result_params.events.find((it) => {
      return it.event === "IncreaseLiquidity";
    });

    tokenId = event.args.tokenId.toNumber();
  });

  describe("#collect", () => {
    it("collect successfully", async () => {
      const collectStatic = await nonfungiblePositionManager.callStatic.collect(
        {
          tokenId: tokenId,
          recipient: admin.address,
          amount0Max: ethers.utils.parseEther("10"),
          amount1Max: ethers.utils.parseEther("10"),
        }
      );

      expect(amountIn * feeTier - amountIn * feeTier * feeProtocol - 1).to.eq(
        collectStatic.amount0
      );
    });

    it("cannot be called by other addresses", async () => {
      await expect(
        nonfungiblePositionManager.connect(alice).collect({
          tokenId,
          recipient: alice.address,
          amount0Max: ethers.utils.parseEther("10"),
          amount1Max: ethers.utils.parseEther("10"),
        })
      ).to.be.revertedWith("Not approved");
    });

    it("cannot be called with 0 for both amounts", async () => {
      await expect(
        nonfungiblePositionManager.collect({
          tokenId,
          recipient: admin.address,
          amount0Max: 0,
          amount1Max: 0,
        })
      ).to.be.reverted;
    });
  });
});
