const { ethers } = require("hardhat");

const deployTestContract = (exports.deployTestContract = async function (
  admin
) {
  // const zeroAddress = "0x0000000000000000000000000000000000000000";
  const DaiToken = await ethers.getContractFactory("Dai");
  const WETHToken = await ethers.getContractFactory("WETH9");
  const WBTC = await ethers.getContractFactory("WBTC");
  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const dai = await DaiToken.deploy(5);
  const weth = await WETHToken.deploy();
  const wbtc = await WBTC.deploy();
  const testERC20 = await TestERC20.deploy(
    "100000000000000000000000000000000000000000000000000000000"
  );

  const XSwapFactory = await ethers.getContractFactory("XSwapFactory");
  const xSwapFactory = await XSwapFactory.deploy();
  await xSwapFactory.deployed();

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
    xSwapFactory.address,
    feeTakersParam
  );

  await xSwapFactory.setTreasury(xSwapTreasury.address);

  const NFTDescriptor = await hre.ethers.getContractFactory("NFTDescriptor");

  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();

  const PositionDescriptor = await hre.ethers.getContractFactory(
    "NonfungibleTokenPositionDescriptor",
    {
      libraries: {
        NFTDescriptor: nftDescriptor.address,
      },
    }
  );

  const nonfungiblePositionDescriptor = await PositionDescriptor.deploy(
    weth.address,
    "0x4554480000000000000000000000000000000000000000000000000000000000"
  );
  await nonfungiblePositionDescriptor.deployed();

  const NonfungiblePositionManager = await hre.ethers.getContractFactory(
    "NonfungiblePositionManager"
  );

  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    xSwapFactory.address,
    weth.address,
    nonfungiblePositionDescriptor.address
  );
  await nonfungiblePositionManager.deployed();

  const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");

  const swapRouter = await SwapRouter.deploy(
    xSwapFactory.address,
    weth.address
  );
  await swapRouter.deployed();

  // Approve contract for swapping and minting
  await dai.mint(
    admin.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await wbtc.mint(
    admin.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await dai.approve(
    nonfungiblePositionManager.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await weth.approve(
    nonfungiblePositionManager.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await wbtc.approve(
    nonfungiblePositionManager.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await testERC20.approve(
    nonfungiblePositionManager.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await dai.approve(
    swapRouter.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await weth.approve(
    swapRouter.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await wbtc.approve(
    swapRouter.address,
    ethers.utils.parseEther("10000000000000000000000")
  );
  await testERC20.approve(
    swapRouter.address,
    ethers.utils.parseEther("10000000000000000000000")
  );

  console.log("Completed!");

  return [
    dai,
    weth,
    wbtc,
    testERC20,
    xSwapFactory,
    nftDescriptor,
    nonfungiblePositionDescriptor,
    nonfungiblePositionManager,
    swapRouter,
  ];
});
