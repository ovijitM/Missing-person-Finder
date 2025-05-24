const MainSystem = artifacts.require("MainSystem");
const UserRegistration = artifacts.require("UserRegistration");
const Report = artifacts.require("Report");
const InvestigatorContract = artifacts.require("InvestigatorContract");
const InvestigatorAppointment = artifacts.require("InvestigatorAppointment");

module.exports = async function (deployer) {
  const userRegistry = await UserRegistration.deployed();
  const report = await Report.deployed();
  const investigator = await InvestigatorContract.deployed();
  const appointment = await InvestigatorAppointment.deployed();
  deployer.deploy(MainSystem, userRegistry.address, report.address, investigator.address, appointment.address);
};
