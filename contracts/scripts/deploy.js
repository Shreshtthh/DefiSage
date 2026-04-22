const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts to BSC Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MockUSDC
  console.log("📄 Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Deploy MockVault
  console.log("\n📄 Deploying MockVault...");
  const MockVault = await hre.ethers.getContractFactory("MockVault");
  const vault = await MockVault.deploy(usdcAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ MockVault deployed to:", vaultAddress);

  // Mint initial USDC
  console.log("\n💰 Minting test USDC...");
  const mintTx = await usdc.mint(hre.ethers.parseUnits("10000", 6));
  await mintTx.wait();
  console.log("✅ Minted 10,000 mUSDC to deployer");

  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("MockUSDC:  ", usdcAddress);
  console.log("MockVault: ", vaultAddress);
  console.log("\n🔗 View on BscScan:");
  console.log(`https://testnet.bscscan.com/address/${usdcAddress}`);
  console.log(`https://testnet.bscscan.com/address/${vaultAddress}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
