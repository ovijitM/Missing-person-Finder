#!/usr/bin/env node

/**
 * Deploy contract and update config.js with the new address
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

console.log("🚀 Starting deployment...\n");

// Deploy the contract
exec(
  "npx truffle migrate --reset",
  { cwd: process.cwd() },
  (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Deployment failed!");
      console.error(error);
      process.exit(1);
    }

    console.log(stdout);

    // Read the contract address from the deployment output
    const addressFile = path.join(
      __dirname,
      "src",
      "contracts",
      "contract-address.json",
    );

    if (!fs.existsSync(addressFile)) {
      console.error("❌ Contract address file not found!");
      process.exit(1);
    }

    const addressData = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    const contractAddress = addressData.MissingPersonsSystem.address;

    console.log(`\n✅ Contract deployed at: ${contractAddress}\n`);

    // Read the compiled contract ABI
    const compiledFile = path.join(
      __dirname,
      "build",
      "contracts",
      "MissingPersonsSystem.json",
    );
    const compiled = JSON.parse(fs.readFileSync(compiledFile, "utf8"));
    const abi = compiled.abi;

    // Update config.js with the new address and ABI
    const configContent = `/**
 * Configuration for Web3 connection and contract ABI
 * Auto-updated on ${new Date().toISOString()}
 */

// Contract address (auto-updated from deployment)
const CONTRACT_ADDRESS = "${contractAddress}";

// Contract ABI
const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};
`;

    const configPath = path.join(__dirname, "frontend", "config.js");
    fs.writeFileSync(configPath, configContent);

    console.log(`✅ config.js updated with new address: ${contractAddress}`);
    console.log(`\n🎉 Deployment complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(
      `   1. Start http-server: cd frontend && npx http-server -p 8000`,
    );
    console.log(`   2. Open http://localhost:8000/portal.html`);
    console.log(`   3. Click "Access Portal" to connect MetaMask\n`);
  },
);
