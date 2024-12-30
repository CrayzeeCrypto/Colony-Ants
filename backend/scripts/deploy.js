// scripts/deploy.js
const hre = require("hardhat");
require("dotenv").config({ path: "../../.env" });

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Set gas price in wei directly (40 gwei = 40 * 10^9 wei)
    const gasPrice = 40000000000; 

    // Deploy ColonyAnt token with the gas price set
    const ColonyAnt = await hre.ethers.getContractFactory("ColonyAnt");
    const colonyAnt = await ColonyAnt.deploy({ gasPrice: gasPrice, gasLimit: 10000000 });
    await colonyAnt.waitForDeployment();
    console.log("ColonyAnt deployed to:", await colonyAnt.getAddress());

    // Deploy ColonyMap contract, passing the ColonyAnt address and setting gas price
    const ColonyMap = await hre.ethers.getContractFactory("ColonyMap");
	const colonyMap = await ColonyMap.deploy(await colonyAnt.getAddress(), { gasPrice: gasPrice, gasLimit: 10000000 });
    await colonyMap.waitForDeployment();
    console.log("ColonyMap deployed to:", await colonyMap.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });