const hre = require("hardhat");
const { BigNumber } = require("ethers");
const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const { ethers } = hre;
const { getContracts } = require("./utils");

async function main() {
  const network = hre.network.name;
  const contracts = await getContracts(network)[network];

  const token0Address = "0x2a5c77b016Df1b3b0AE4E79a68F8adF64Ee741ba";
  const token1Address = "0xdf5038d080ca5bd21c6c90f0b004306a26af4ba8";
  const mintParams = {
    token0: token0Address,
    token1: token1Address,
    fee: 3000,
    tickLower: getMinTick(3000),
    tickUpper: getMaxTick(3000),
    amount0Desired: ethers.utils.parseEther("100"),
    amount1Desired: ethers.utils.parseEther("180000"),
    amount0Min: 0,
    amount1Min: 0,
    recipient: "0xE94219d3368C061618eF370E108b3795F5081C70",
    deadline: 1680849320,
  };

  // Deploy contract
  // const xSwapV3Factory = await hre.ethers.getContractAt(
  //   "XSwapFactory",
  //   contracts.xSwapV3Factory
  // );

  // await xSwapV3Factory.createPool(token0Address, token1Address, 3000);
  // const poolAddress = await xSwapV3Factory.getPool(
  //   token0Address,
  //   token1Address,
  //   3000
  // );

  // const xSwapPool = await hre.ethers.getContractAt("XSwapPool", poolAddress);
  // console.log(await xSwapPool.slot0());
  // await xSwapPool.initialize(encodePriceSqrt(28000, 1));

  const nonfungiblePositionManager = await hre.ethers.getContractAt(
    "NonfungiblePositionManager",
    contracts.nonfungiblePositionManager
  );

  // await nonfungiblePositionManager.createAndInitializePoolIfNecessary(
  //   token0Address,
  //   token1Address,
  //   3000,
  //   encodePriceSqrt(1, 28000)
  // );
  // await nonfungiblePositionManager.mint(mintParams);
  const selectorOne = web3.eth.abi.encodeFunctionSignature(
    "createAndInitializePoolIfNecessary(address,address,uint24,uint160)"
  );
  const selectorTwo = web3.eth.abi.encodeFunctionSignature(
    "mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))"
  );

  const sqrtPriceX96 = encodePriceSqrt(1, 1800);

  const paramsOne = web3.eth.abi.encodeParameters(
    ["address", "address", "uint24", "uint160"],
    [token0Address, token1Address, 100, sqrtPriceX96]
  );

  const paramsTwo = web3.eth.abi.encodeParameters(
    [
      "address",
      "address",
      "uint24",
      "int24",
      "int24",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "address",
      "uint256",
    ],
    [
      token0Address,
      token1Address,
      100,
      getMinTick(100),
      getMaxTick(100),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("180000"),
      0,
      0,
      "0xE94219d3368C061618eF370E108b3795F5081C70",
      1680862560,
    ]
  );
  const firstData = selectorOne + paramsOne.slice(2);
  const secondData = selectorTwo + paramsTwo.slice(2);
  const data = [firstData, secondData];
  await nonfungiblePositionManager.multicall(data);
}

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}
function getMinTick(tickSpacing) {
  return Math.ceil(-887272 / tickSpacing) * tickSpacing;
}

function getMaxTick(tickSpacing) {
  return Math.floor(887272 / tickSpacing) * tickSpacing;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
