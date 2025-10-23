import hre from "hardhat";

async function main() {
  console.log("Deploying iotledger to MegaETH...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("IoTLedgerContract");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  console.log("IoTLedgerContract deployed to:", contract.target);
  console.log("Verify on explorer: https://megaexplorer.xyz/address/" + contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});