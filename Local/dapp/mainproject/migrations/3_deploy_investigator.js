const UserRegistration = artifacts.require("UserRegistration");
const Report = artifacts.require("Report");
const InvestigatorContract = artifacts.require("InvestigatorContract");

module.exports = async function (deployer) {
  const userRegistrationInstance = await UserRegistration.deployed();
  const reportInstance = await Report.deployed();
  
  await deployer.deploy(InvestigatorContract, userRegistrationInstance.address, reportInstance.address);
};
