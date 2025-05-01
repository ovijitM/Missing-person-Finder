const Report = artifacts.require("Report");
const UserRegistration = artifacts.require("UserRegistration");

module.exports = async function (deployer) {
  const userRegInstance = await UserRegistration.deployed();

  await deployer.deploy(Report, userRegInstance.address);
};
