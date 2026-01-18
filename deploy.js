const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

// Read contract ABI and bytecode
const contractPath = path.join(
  __dirname,
  "build/contracts/MissingPersonsSystem.json",
);
const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const CONTRACT_ABI = contractJson.abi;
const CONTRACT_BYTECODE = contractJson.bytecode;

async function deploy() {
  try {
    // Connect to Ganache
    const web3 = new Web3("http://127.0.0.1:8585");

    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const deployerAccount = accounts[0];

    console.log("🔗 Connected to Ganache");
    console.log(`📝 Deploying from account: ${deployerAccount}`);

    // Create contract
    const contract = new web3.eth.Contract(CONTRACT_ABI);

    // Deploy
    console.log("⏳ Deploying contract...");
    const deployed = await contract
      .deploy({
        data: CONTRACT_BYTECODE,
        arguments: [],
      })
      .send({
        from: deployerAccount,
        gas: 5000000,
        gasPrice: web3.utils.toWei("2", "gwei"),
      });

    console.log("\n✅ Deployment successful!");
    console.log(`📍 Contract Address: ${deployed.options.address}`);

    // Save to config
    const configPath = path.join(__dirname, "frontend/config.js");
    let config = fs.readFileSync(configPath, "utf8");
    config = config.replace(
      /const CONTRACT_ADDRESS = "0x[^"]*";/,
      `const CONTRACT_ADDRESS = "${deployed.options.address}";`,
    );
    fs.writeFileSync(configPath, config);

    console.log("\n✨ Updated frontend/config.js with new contract address");
    console.log("\n🎉 Ready to use! Open frontend/index.html in your browser");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

deploy();
