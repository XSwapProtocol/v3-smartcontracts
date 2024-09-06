require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");

require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
const infuraKey = process.env.INFURA_KEY;
const ethApiKey = process.env.ETHEREUM_API_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    hardhat: {
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      forking: {
        url: `https://goerli.infura.io/v3/${infuraKey}`,
        blockNumber: 8777755,
      },
    },
    test_xdc: {
      url: `https://rpc.apothem.network`,
      accounts: [privateKey],
      chainId: 51,
      gasPrice: 1000000000,
      timeout: 20000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraKey}`,
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: ethApiKey,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    gasPrice: 21,
  },
  mocha: {
    timeout: 100000,
  },
};

module.exports.networks.xdc = {
  chainId: 50,
  gasPrice: 500000000, //0.5 Gwei for xinfin network
  url: `https://rpc.xinfin.network`,
  accounts: [privateKey],
  timeout: 20000,
};
