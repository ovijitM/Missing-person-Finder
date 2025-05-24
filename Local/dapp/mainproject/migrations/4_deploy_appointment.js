const InvestigatorAppointment = artifacts.require("InvestigatorAppointment");
const UserRegistration = artifacts.require("UserRegistration");

module.exports = async function (deployer) {
    const userRegInstance = await UserRegistration.deployed();
    await deployer.deploy(InvestigatorAppointment, userRegInstance.address);
};
