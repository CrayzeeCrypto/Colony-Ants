import React from 'react';
import { createRoot } from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css';
import './App.css';
import { MetaMaskProvider } from "@metamask/sdk-react"


const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 12227332],
});

function getLibrary(provider) {
  return new Web3Provider(provider);
}

const root = createRoot(document.getElementById('root'));
root.render(
  <Web3ReactProvider connectors={[[injected, 'injected']]} getLibrary={getLibrary}>
    <MetaMaskProvider 
      sdkOptions={{
        dappMetadata: {
          name: "Colony Ants",
          url: "https://colonyants.com",
        },
      }}
    >
      <App />
    </MetaMaskProvider>
  </Web3ReactProvider>
);