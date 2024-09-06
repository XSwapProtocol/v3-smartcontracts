const { BigNumber } = require("ethers");

exports.getMinTick = function (tickSpacing) {
  return Math.ceil(-887272 / tickSpacing) * tickSpacing;
};

exports.getMaxTick = function (tickSpacing) {
  return Math.floor(887272 / tickSpacing) * tickSpacing;
};

exports.getMaxLiquidityPerTick = function (tickSpacing) {
  return BigNumber.from(2)
    .pow(128)
    .sub(1)
    .div((getMaxTick(tickSpacing) - getMinTick(tickSpacing)) / tickSpacing + 1);
};
