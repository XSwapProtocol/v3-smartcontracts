const { BigNumber } = require("ethers");

exports.expandToDecimals = function (amount, decimals) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals));
};
