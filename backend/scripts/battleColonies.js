require('dotenv').config({ path: '../../.env' });
const colonyMapABI = require('../artifacts/contracts/ColonyMap.sol/ColonyMap.json').abi;
const { ethers } = require("ethers");
const readline = require('readline');

// TO RUN THIS SCRIPT: navigate to backend\scripts and then run 'node battleColonies.js'

const CONTRACT_ADDRESS = process.env.COLONY_MAP_CONTRACT_ADDRESS; // Verify contract address is correct
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.NEOX_MAINNET_RPC_URL; // Verify switched to correct network (MAINNET or TESTNET)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log("Please confirm the following details before proceeding:");
    console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
    console.log("RPC_URL:", RPC_URL);

    const confirmEnv = await askQuestion("Do you confirm these environment details? (yes/no) ");
    if (confirmEnv.toLowerCase() !== 'yes') {
        console.log("Script terminated. Please check your environment variables.");
        rl.close();
        return;
    }

    // Enter the top two countries
    const attacker = "US"; // Verify attacker and defender country codes
    const defender = "CN"; // Verify attacker and defender country codes

    console.log("The battle is set to occur between:");
    console.log("Attacker:", attacker);
    console.log("Defender:", defender);

    const confirmBattle = await askQuestion("Do you confirm these countries for the battle? (yes/no) ");
    if (confirmBattle.toLowerCase() !== 'yes') {
        console.log("Script terminated. Please verify the country codes.");
        rl.close();
        return;
    }

    // Connect to the network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create a wallet instance
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, colonyMapABI, wallet);

    try {
        // Call the battle function
        const tx = await contract.battle(attacker, defender);
        console.log("Transaction hash:", tx.hash);

        // Wait for the transaction to be mined
        const txReceipt = await tx.wait();
        console.log("Battle between " + attacker + " and " + defender + " concluded successfully.");
        console.log("Gas used:", txReceipt.gasUsed.toString());
        console.log("Transaction status:", txReceipt.status); // 1 if success, 0 if fail

        const battleConcludedEvent = txReceipt.logs.find(log => log.address === CONTRACT_ADDRESS && log.topics[0] === ethers.id("BattleConcluded(string,string,string)"));

        if (battleConcludedEvent) {
            // Decode the event data
            const interface = new ethers.Interface(colonyMapABI);
            const event = interface.parseLog(battleConcludedEvent);
            console.log("Battle winner:", event.args.winner);
        } else {
            console.log("No BattleConcluded event found in this transaction.");
        }

    } catch (error) {
        if (error.error && error.error.data) {
            let revertReason = ethers.utils.toUtf8String('0x' + error.error.data.slice(138));
            console.error("Transaction reverted with reason:", revertReason);
        } else {
            console.error("Error executing battle:", error.message);
        }
    }
    rl.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
