import { ethers,run } from "hardhat";
import { SampleToken, OrderSwap } from "../typechain-types";

async function main() {
  // const SampleToken = await ethers.getContractFactory("SampleToken");
  // const sampleToken = await SampleToken.deploy("SampleToken", "SToken");
  // await sampleToken.waitForDeployment();

  
  //deploy contract
  const OrderSwap = await ethers.getContractFactory("OrderSwap");
  const orderSwap = await OrderSwap.deploy();
  await orderSwap.waitForDeployment();

  // console.log("SampleToken Token waitForDeployment to:", sampleToken.target);
  console.log("OrderSwap waitForDeployment to:", orderSwap.target);

  await run("verify:verify", {
    address: orderSwap.target,
    constructorArguments: [
     
    
    ],
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

