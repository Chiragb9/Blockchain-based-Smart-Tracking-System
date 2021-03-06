const Test = artifacts.require("Tracktest");

module.exports = function (deployer) {
  deployer.deploy(Test);
};