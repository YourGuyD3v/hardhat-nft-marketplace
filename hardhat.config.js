/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
};
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const RPC_URL = process.env.RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1
    },
    localhost: {
      chainId: 31337
    },
    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
  },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "Gas-Reporter.txt",
    noColor: true,
    // coinMarketcap: COINMARKETCAP_API_KEY
  },
  contractSizer: {
    runOnCompile: false,
    only: ["Raffle"],
},
  solidity: {
    compilers: [
      {
        version: "0.8.8"
      },
      {
        version: "0.8.0"
      }
    ]
  },
  mocha: {
    timeout: 500000, // 500 seconds max for running tests
  }
};