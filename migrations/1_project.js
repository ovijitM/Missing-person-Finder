const projectmissingperson = artifacts.require("MissingPersonsSystem");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(projectmissingperson);
  const instance = await projectmissingperson.deployed();

  const addressData = {
    MissingPersonsSystem: {
      address: instance.address,
      network: network
    }
  };

  const frontendDir = path.join(__dirname, "..", "src", "contracts");
  const outputPath = path.join(frontendDir, "contract-address.json");

  
  fs.mkdirSync(frontendDir, { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(addressData, null, 2));

  console.log(`Contract address saved to ${outputPath}`);
};