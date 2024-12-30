# Colony Ants

## Project Overview
Colony Ants is a decentralized application (dApp) centered around the Colony Ant coin and its associated smart contracts on the NeoX blockchain. The primary interface, **Colony Map**, allows users to contribute Colony Ants to build virtual colonies in different countries visualized on a world map. However, the Colony Ant coin and smart contracts are designed to be versatile, enabling integration with various interfaces beyond the initial Colony Map.

### Key Features:
- **Colony Map Interface:** A React application where users can interactively contribute to country-specific colonies.  
- **Decentralized Token (Colony Ant):** Can be used with other interfaces or applications developed by the community.  

---

## Installation

### Prerequisites
- Node.js >=22.11.0 (Current version used for development and testing)  
- npm or Yarn (npm is assumed here)  
- MetaMask for wallet interaction (for local testing with NeoX)  

### Steps
1. **Clone the Repository:**  
   ```sh
   git clone [your-repository-url]
   cd colony-ants-frontend
   ```
   
2. **Install Dependencies:**  
   ```sh
   npm install
   ```

3. **Set up Environment Variables:**  
   Create a `.env` file in the root directory of both frontend and backend:  
   ```plaintext
   REACT_APP_NEOX_RPC_URL=[your-rpc-url]
   REACT_APP_COLONY_MAP_CONTRACT=[your-contract-address]
   REACT_APP_COLONY_ANT_CONTRACT=[your-colony-ant-contract-address]
   ```
   *Note: These values should be set in Vercel's environment variables for production.*  

4. **Run the Application:**  

   For the frontend:  
   ```sh
   cd frontend
   npm start
   ```
   This will start the development server at `localhost:3000`.  

   For the backend (if applicable, assuming Hardhat for smart contract testing/deployment):  
   ```sh
   cd backend
   npx hardhat node
   ```
   This starts a local Ethereum node for development.  

---

## Usage
- Connect your MetaMask wallet to the NeoX network.  
- Use the Colony Map to contribute ants to countries or explore other interfaces if developed by the community.  
- Monitor your contributions and see the colonies grow on the map.  

---

## Contributing

### How to Contribute
1. Fork the project.  
2. Create your feature branch:  
   ```sh
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:  
   ```sh
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:  
   ```sh
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.  

---

### Coding Standards
- Follow JavaScript/React best practices in the frontend and Solidity best practices in the backend.  
- Use ESLint for frontend code linting and follow Hardhat's conventions for smart contract development.  

---

## Extending the Ecosystem
The **Colony Map** is open for community development. Feel free to create new interfaces or uses for interacting with the Colony Ant token, while the Colony Ant coin and its smart contract remain stable and unchanged.
---

## Deployment

### Vercel Deployment
Ensure you have environment variables set in Vercel:  
- `NEOX_RPC_URL`  
- `COLONY_MAP_CONTRACT`  
- `COLONY_ANT_CONTRACT`  

Deploy via:  
```sh
cd frontend
vercel --prod
```

---

## Architecture Overview
- **Frontend:** React with hooks for state management in the Colony Map.  
- **Backend:** Smart contracts on NeoX blockchain for handling contributions and token operations, managed with Hardhat.  

---

## License
This project is licensed under the MIT License [LICENSE.md](LICENSE.md). This license encourages open-source contributions and use in commercial applications while maintaining copyright over the original work.

---

## FAQ/Troubleshooting
- **Q: My contributions aren't showing up on the map?**  
  A: Ensure your wallet is connected to NeoX, that you have approved the two transactions, and you've waited for the transaction to be mined.  
- **Q: I'm seeing errors with smart contract interactions?**  
  A: Check if your environment variables are set correctly and your wallet has the necessary permissions.  
- **Q: Can I use Colony Ant coins with another application?**  
  A: Yes! The Colony Ant token is designed to be used with various interfaces. Feel free to develop new uses or interfaces.  

---

## Security
All smart contract interactions are secured via MetaMask's wallet and require user confirmation for transactions.  
