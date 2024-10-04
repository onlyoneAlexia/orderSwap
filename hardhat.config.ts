import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env" });

const ALCHEMY_MAINNET_API_KEY_URL = process.env.ALCHEMY_MAINNET_API_KEY_URL;
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      forking: {
        url: ALCHEMY_MAINNET_API_KEY_URL,
      }
    },
        "lisk-sepolia": {
          url: "https://rpc.sepolia-api.lisk.com/"!,
          accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
          gasPrice: 1000000000,
        },
        "localhost":{
          url: 'http://localhost:8545',
        //  accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
        }
      },
      etherscan: {
        // Use "123" as a placeholder, because Blockscout doesn't need a real API key, and Hardhat will complain if this property isn't set.
        apiKey: {
          "lisk-sepolia": "123",
        },
        customChains: [
          {
            network: "lisk-sepolia",
            chainId: 4202,
            urls: {
              apiURL: "https://sepolia-blockscout.lisk.com/api",
              browserURL: "https://sepolia-blockscout.lisk.com/",
            },
          },
        ],
      },
      sourcify: {
        enabled: false,
      },
    };
  