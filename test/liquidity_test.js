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
  let testERC20;
  let xSwapFactory;
  let nonfungiblePositionManager;
  let admin;
  let bob;
  let alice;
  let block;
  let mint_result;
  let token1st;
  let token2nd;
  let amount0Desired;
  let amount1Desired;
  let tokenId;
  let daiBalanceBefore;
  let testERC20BalanceBefore;
  let daiBalanceAfter;
  let testERC20BalanceAfter;

  before(async function () {
    [admin, bob, alice] = await ethers.getSigners();
    [dai, , , testERC20, xSwapFactory, , , nonfungiblePositionManager, ,] =
      await deployTestContract(admin);

    const blockNum = await ethers.provider.getBlockNumber();
    block = await ethers.provider.getBlock(blockNum);
    const expectedAddress = computePoolAddress(
      xSwapFactory.address,
      [dai.address, testERC20.address],
      3000
    );

    const code = await admin.provider.getCode(expectedAddress);
    expect(code).to.eq("0x");
    await xSwapFactory.createPool(dai.address, testERC20.address, 3000);
    const pool = new ethers.Contract(expectedAddress, abi, admin);
    await pool.initialize(encodePriceSqrt(1, 1500));
    const codeAfter = await admin.provider.getCode(expectedAddress);
    expect(codeAfter).to.not.eq("0x");
    console.log("Pool created!");

    daiBalanceBefore = await dai.balanceOf(admin.address);
    testERC20BalanceBefore = await testERC20.balanceOf(admin.address);

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

    const mintParams = {
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
    mint_result = await nonfungiblePositionManager.mint(mintParams);
    console.log("Mint succeed");
  });

  describe("#liquidityTest", async function () {
    it("Increase liquidity of a pool", async () => {
      const mint_result_params = await mint_result.wait();
      const event = mint_result_params.events.find((it) => {
        return it.event === "IncreaseLiquidity";
      });

      tokenId = event.args.tokenId.toNumber();

      const increaseLiquidityParams = {
        tokenId: tokenId,
        amount0Desired: amount0Desired,
        amount1Desired: amount0Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: block.timestamp + 120,
      };
      await nonfungiblePositionManager.increaseLiquidity(
        increaseLiquidityParams
      );
      console.log("Increase liquidity successfully");
    });

    it("Decrease liquidity of a pool", async () => {
      const liquidityBefore = (
        await nonfungiblePositionManager.positions(tokenId)
      ).liquidity;

      const decreaseLiquidityParams = {
        tokenId: tokenId,
        liquidity: liquidityBefore,
        amount0Min: 0,
        amount1Min: 0,
        deadline: block.timestamp + 120,
      };
      await nonfungiblePositionManager.decreaseLiquidity(
        decreaseLiquidityParams
      );

      const liquidityAfter = (
        await nonfungiblePositionManager.positions(tokenId)
      ).liquidity;

      expect(liquidityAfter).to.eq(0);

      daiBalanceAfter = await dai.balanceOf(admin.address);
      testERC20BalanceAfter = await testERC20.balanceOf(admin.address);

      console.log(`Balance of dai before: ${daiBalanceBefore}`);
      console.log(`Balance of dai after: ${daiBalanceAfter}`);
      console.log(`Balance of testERC20 before: ${testERC20BalanceBefore}`);
      console.log(`Balance of testERC20 after: ${testERC20BalanceAfter}`);
    });

    it("Revert decrease liquidity of a pool due to deadline", async () => {
      const liquidity = (await nonfungiblePositionManager.positions(tokenId))
        .liquidity;

      const decreaseLiquidityParams = {
        tokenId: tokenId,
        liquidity: liquidity,
        amount0Min: 0,
        amount1Min: 0,
        deadline: block.timestamp + 10,
      };

      await expect(
        nonfungiblePositionManager.decreaseLiquidity(decreaseLiquidityParams)
      ).to.be.reverted;
    });

    it("Revert decrease liquidity of a pool due to amountMin", async () => {
        const liquidity = (await nonfungiblePositionManager.positions(tokenId))
          .liquidity;
  
        const decreaseLiquidityParams = {
          tokenId: tokenId,
          liquidity: liquidity,
          amount0Min: amount0Desired + amount0Desired,
          amount1Min: 0,
          deadline: block.timestamp + 120,
        };
  
        await expect(
          nonfungiblePositionManager.decreaseLiquidity(decreaseLiquidityParams)
        ).to.be.reverted;
      });
  });
});
