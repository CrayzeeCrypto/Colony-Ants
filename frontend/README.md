# Colony Map Frontend

Welcome to the frontend of Colony Ants! The Colony Map visualizes global contributions to ant colonies in countries across the world.

## Project Overview
This frontend is built using React, leveraging Create React App for initial setup. The key component is:

- **Map.js**: Displays a world map where each country's contribution to the ant colonies is represented visually.

**Interaction**:
- **Hover**: Hover over a country to see the colony name and current contributions.
- **Click**: Click on a country to contribute an ant to the colony.
- **Visualization**: Contributions are shown by color intensity, with the darker red indicating the largest colonies.

**Data**:
- The map uses data fetched from the Colony Map smart contract on the NeoX blockchain.

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation
```bash
npm install
```

### Available Scripts
- npm start: Runs the app in development mode. Open http://localhost:3000 to view it in your browser.
- npm run build: Builds the app for production to the build folder.

### Learn More
- For general React knowledge, see React Documentation.
- For specifics on Create React App, see CRA Documentation.

### Troubleshooting
- If npm run build fails, check for minification errors or refer to the CRA documentation for common issues.