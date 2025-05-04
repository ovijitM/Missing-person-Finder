const MissingPersonsSystem = artifacts.require("MissingPersonsSystem");
module.exports = function (deployer) {
  deployer.deploy(MissingPersonsSystem);
};