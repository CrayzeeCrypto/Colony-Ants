# Colony Ants Backend: Smart Contracts

This directory contains the smart contracts for the Colony Ants project on the NeoX blockchain. Here, we detail the `ColonyAnt` and `ColonyMap` contracts.

## Overview

- **ColonyAnt:** An ERC20 token contract for managing the Colony Ant token.
- **ColonyMap:** Manages contributions to different countries and includes game mechanics like battles.

## Smart Contracts

### ColonyAnt.sol

**Purpose:** 
- This contract implements the Colony Ant (CANT) ERC20 token with a fixed supply.

**Key Features:**
- **Total Supply:** Fixed at 10 billion CANT with 18 decimals.
- **Mint:** All tokens are minted to the contract deployer at initialization.
- **Burn:** Allows token holders to destroy their own tokens.

**Functions:**
- `constructor()`: Mints the entire MAX_SUPPLY to the deployer.
- `burn(uint256 amount)`: Burns the specified amount of tokens from the caller's balance.

**Note:** The Colony Ant token is a standalone ERC20 token and can be used independently of the `ColonyMap` contract. It's designed for broader integration within the ecosystem or other applications.

### ColonyMap.sol

**Purpose:**
- Manages contributions (in Colony Ant tokens) to different countries, tracks contribution history, and provides mechanics for a "battle" system.

**Key Features:**
- **Contributions:** Tracks contributions per country code.
- **Contribution Limiting:** Implements an hourly limit per user.
- **Battle System:** A simple battle mechanism where countries can compete based on contribution weight.

**Functions:**
- `constructor(address _tokenAddress)`: Initializes with the address of the Colony Ant token.
- `contribute(string memory _countryCode, uint256 _amount)`:
  - Allows users to contribute Colony Ants to a country, with checks:
    - Contribution must be exactly 1 Colony Ant (`MIN_CONTRIBUTION`).
    - User can only contribute once per hour.
  - Transfers tokens from user to contract and updates contributions.
  - Emits `Contribution` event.

- `battle(string memory _attacker, string memory _defender)`:
  - Only callable by the contract owner.
  - Simulates a battle between two countries based on their contribution weights.
  - Uses a simple random number for determining the winner but weighted by contributions.
  - Emits `BattleConcluded` event with the result.

- `withdrawTokens(address _to, uint256 _amount, string[] memory _countryCodes)`:
  - Only owner can withdraw tokens from the contract, resetting contributions for specified countries.
  - Emits `TokensWithdrawn` event.

- `getCountryContributions(string memory _countryCode)`:
  - View function to check contributions for a country.

- `getLastContributionTime(address _contributor)`:
  - Returns the timestamp of the last contribution by a specific address.

- `getContributorCountry(address _contributor)`:
  - Returns the last country contributed to by an address.

**Security and Access Control:**
- Uses `Ownable` for admin functions.
- Implements `ReentrancyGuard` to prevent reentrancy attacks.
- Utilizes `SafeERC20` for safe token transfers.

## Setup

To interact with this project for testing new features, deploying to a live or test environment, or educational purposes:

### Prerequisites
- Node.js (Project currently uses 22.11.0, but older versions likely work)
- Hardhat installed globally or locally

### Installation
```sh
npm install
```

### Compiling Contracts
```sh
npx hardhat compile
```

### Deploying Contracts
```sh
npx hardhat run scripts/deploy.js --network [network-name]
```
Replace [network-name] with one of the following network configurations defined in hardhat.config.js:
- neoxTestnet for the NeoX testnet.
- neoxMainnet for the NeoX mainnet.

## Environment Variables
- NEOX_RPC_URL: RPC URL for connecting to the NeoX network.
- COLONY_ANT_CONTRACT: Address of the deployed ColonyAnt contract.
- COLONY_MAP_CONTRACT: Address of the deployed ColonyMap contract.

## Interaction
- Use methods like contribute to add to a country's colony, battle to engage in game mechanics, and getCountryContributions for querying.

## License
This backend is licensed under the MIT License. See [LICENSE.md](../LICENSE.md) for details.