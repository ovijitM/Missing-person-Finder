const fs = require("fs");
const compiled = JSON.parse(
  fs.readFileSync("build/contracts/MissingPersonsSystem.json", "utf8"),
);
const abi = compiled.abi;

const configContent = `/**
 * Configuration for Web3 connection and contract ABI
 */

// Replace these with your actual contract details
const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // Update with your contract address

const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};
`;

fs.writeFileSync("frontend/config.js", configContent);
console.log("✅ Config.js updated with correct ABI from compiled contract");
