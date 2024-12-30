require('dotenv').config({ path: '../../.env' });
const { ethers } = require("ethers");
const colonyMapABI = require('../artifacts/contracts/ColonyMap.sol/ColonyMap.json').abi;

// TO RUN THIS SCRIPT: navigate to backend\scripts and then run 'node withdrawTokens.js'

// Basic IERC20 ABI for balanceOf function
const ierc20ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
    //Connect to the network	
    const provider = new ethers.JsonRpcProvider(process.env.NEOX_TESTNET_RPC_URL); //Change to MainNet on Deployment

    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = process.env.COLONY_MAP_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, colonyMapABI, wallet);

    const toAddress = process.env.TOKENS_RECIPIENT_ADDRESS; // Address to send the tokens
	const countryCodes = ["US", "CN"]; // Countries to be cleared
	
    console.log(`Transferring all tokens to address: ${toAddress} and clearing contributions for countries: ${countryCodes.join(", ")}`);

    try {
        // Get the address of the token contract stored in the ColonyMap contract
		const colonyAntAddress = await contract.colonyAnt();
		console.log("Colony Ant Address:", colonyAntAddress);
		
		// Ensure the address is correctly formatted
		const formattedColonyAntAddress = ethers.getAddress(colonyAntAddress);
		console.log("Formatted Colony Ant Address:", formattedColonyAntAddress);

		// Create a new contract instance for the token using the IERC20 ABI
		const colonyAnt = new ethers.Contract(formattedColonyAntAddress, ierc20ABI, provider);

		// Fetch the balance of tokens in the contract
		const contractBalance = await colonyAnt.balanceOf(contract.target);
		console.log("contractBalance: ", contractBalance);

        console.log(`Transferring all tokens: ${ethers.formatUnits(contractBalance, 18)} Colony Ants`);

        // Execute the withdrawal for the entire balance
        const tx = await contract.withdrawTokens(toAddress, contractBalance, countryCodes, { gasLimit: 1000000 });
        console.log("Transaction hash:", tx.hash);
		
		const receipt = await tx.wait();
        console.log("All tokens withdrawn successfully, contributions cleared for countries.");
        console.log("Gas used:", receipt.gasUsed.toString());
	} catch (error) {
        console.error("Failed to withdraw tokens:", error);
    }
}

main().catch(console.error);
