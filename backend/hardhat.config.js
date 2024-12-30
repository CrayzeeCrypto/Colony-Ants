require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "shanghai"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  remappings: [
    "@openzeppelin/=node_modules/@openzeppelin/"
  ],
  networks: {
    neoxTestnet: {
      url: process.env.NEOX_TESTNET_RPC_URL,
      chainId: 12227332,
      accounts: [process.env.PRIVATE_KEY]
    },
    neoxMainnet: {
      url: process.env.NEOX_MAINNET_RPC_URL,
      chainId: 47763,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};