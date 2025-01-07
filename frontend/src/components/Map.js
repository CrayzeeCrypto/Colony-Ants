import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Tooltip } from 'react-tooltip';
import '../Map.css';
import countryData from '../data/countryData';
import ColonyMapABI from '../contracts/ColonyMap.json';
import ColonyAntABI from '../contracts/ColonyAnt.json';
import { CONTRACT_ADDRESSES } from '../utils/config';
import { useSDK } from "@metamask/sdk-react"
import colonyAntImage from '../assets/colonyAnt.png'; 
import { scaleSequential } from 'd3-scale';
import { interpolateReds } from 'd3-scale-chromatic';


const Map = () => {
	const [selectedCountry, setSelectedCountry] = useState('');
	const [tooltipContent, setTooltipContent] = useState('');
	const [isWalletConnected, setIsWalletConnected] = useState(false);
	const [geographyData, setGeographyData] = useState(null);
	const [colonyMap, setColonyMap] = useState(null);
	const { sdk, connected } = useSDK();
	const [ContributionAmount, setContributionAmount] = useState('1'); // Default to 1
	const contributionAmountRef = useRef(ContributionAmount);
	const [countryContributions, setCountryContributions] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const handleCountryClick = useRef(null);
	const [transactionStatus, setTransactionStatus] = useState('');
	const [minContribution, maxContribution] = Object.values(countryContributions).reduce((acc, value) => {
		const numericValue = Math.floor(ethers.formatUnits(value, 18));
		return [
			Math.min(acc[0], numericValue),
			Math.max(acc[1], numericValue)
		];
	}, [Infinity, -Infinity]);
	
	useEffect(() => {
		fetch(process.env.PUBLIC_URL + "/ne_50m_admin_0_countries.json")
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
				}
			return response.json();
		})
		.then(data => {setGeographyData(data);
		})
		.catch(error => {
			console.error('Error fetching GeoJSON:', error);
			setError('Error loading map data');
		});
		}, []);

	useEffect(() => {
		const fetchContributionsOnMount = async () => {
			let contractInstance;
			if (colonyMap) {
				contractInstance = colonyMap;
			} else {
				const provider = new ethers.JsonRpcProvider(CONTRACT_ADDRESSES.RPC_URL);
				contractInstance = new ethers.Contract(CONTRACT_ADDRESSES.COLONY_MAP, ColonyMapABI.abi, provider);
			}
			await fetchAndSetContributions(contractInstance); 
		};
		fetchContributionsOnMount();
	}, []);
	
	const fetchAndSetContributions = async (contractInstance) => {
		setLoading(true);
		try {
			const newContributions = await fetchContributions(contractInstance);
			const sortedContributions = Object.entries(newContributions)
				.sort((a, b) => {
					const aValue = ethers.parseUnits(a[1], 18);
					const bValue = ethers.parseUnits(b[1], 18);
					return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
				})
				setCountryContributions(Object.fromEntries(sortedContributions));
			setError(null);
		} catch (error) {
			console.error('Error fetching contributions:', error.message, error.stack);
			setError('Failed to fetch contributions');
		} finally {
			setLoading(false);
		}
	};

	const fetchContributions = async (contractInstance) => {
			const promises = Object.entries(countryData).map(([countryCode]) => 
				contractInstance.getCountryContributions(countryCode).then(contribution => {
					return contribution.toString();
				}).catch(error => {
					console.error(`Failed to fetch contributions for ${countryCode}:`, error);
					return '0';	
					})
			);
			const contributions = await Promise.all(promises);
			return Object.fromEntries(
			Object.keys(countryData).map((code, index) => [code, contributions[index].toString()])
		  	);
	};

	useEffect(() => {
		const initializeColonyMap = async () => {
			const provider = new Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const newColonyMap = new ethers.Contract(CONTRACT_ADDRESSES.COLONY_MAP, ColonyMapABI.abi, signer);
			setColonyMap(newColonyMap);
		};
		if (connected && !colonyMap){
			initializeColonyMap();
		}
	}, [connected, colonyMap]);

	const nonZeroContributions = Object.fromEntries(
		Object.entries(countryContributions).filter(([_, value]) => {
			const numericValue = Math.floor(ethers.formatUnits(value, 18));
			return numericValue > 0;
		})
	);

	const connectWallet = async () => {
		try {
			await sdk.connect();
			setIsWalletConnected(true);
			
			const provider = new Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const newColonyMap = new ethers.Contract(CONTRACT_ADDRESSES.COLONY_MAP, ColonyMapABI.abi, signer);
			setColonyMap(newColonyMap);
		} catch (error) {
			console.error('Failed to connect wallet:', error);
			setError('Wallet connection failed: ' + error.message);
		}
	};
		
	const handleUserRejection = (error) => {
		if (error.code === 4001 || (error.message && (error.message.includes('user rejected') || error.message.includes('User denied')))) {
			setError('User denied transaction signature');
			return true;
		}
		return false;
	};

	const approveTokens = async (spenderAddress, amount) => {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.COLONY_ANT, ColonyAntABI.abi, signer);
			const amountInWei = ethers.parseUnits(amount.toString(), 18);
			const tx = await tokenContract.approve(spenderAddress, amountInWei);
			await tx.wait();
		} catch (error) {
			console.error('Approval failed:', error);
			if (!handleUserRejection(error)) {
            	setError('Approval failed: ' + error.message);
       		}
			throw error;
		}
	};

	const debouncedHandleCountryClick = (e, currentAmount) => {
		if (handleCountryClick.current) {
			return;
		}
		executeCountryClick(e, currentAmount);

		handleCountryClick.current = setTimeout(() => {
			handleCountryClick.current = null;
		}, 10000);
	};

	const executeCountryClick = async (e, currentAmount) => {
		e.originalEvent.stopPropagation();
		const countryCode = e.target.feature.properties['ISO_A2'];
		const countryName = countryData[countryCode]?.name || countryCode;
		if (!countryCode || !countryData[countryCode]) {
			setError("Please select a valid country");
		return;
		}
		setSelectedCountry(countryCode);
		setError('');
		setTransactionStatus(`You are attempting to contribute ${currentAmount} Colony Ant to the ${countryName} Colony. MetaMask may ask you to accept 2 transactions. The first transaction is to authorize an amount. Accept this, wait about 15 seconds, then approve the second transaction to make the contribution. You'll see a success message once your contribution is confirmed.`);						
		if (connected && colonyMap) {
			try {
				const amount = ethers.parseUnits(currentAmount, 18);
				const colonyMapAddress = CONTRACT_ADDRESSES.COLONY_MAP;
				const provider = new ethers.BrowserProvider(window.ethereum);
				const signer = await provider.getSigner();
				const tokenAddress = CONTRACT_ADDRESSES.COLONY_ANT;
				const tokenContract = new ethers.Contract(tokenAddress, ColonyAntABI.abi, signer);
				const currentAllowance = await tokenContract.allowance(await signer.getAddress(), colonyMapAddress);
				const currentAllowanceForCompare = ethers.parseUnits(currentAllowance.toString(), 0);			
				
				if (currentAllowanceForCompare < amount){
					await approveTokens(colonyMapAddress, currentAmount)
				}
				
				const tx = await colonyMap.contribute(countryCode, amount, { gasLimit: 500000 });
				const transaction = await provider.getTransaction(tx.hash);
				await transaction.wait();
      			alert(`You have successfully contributed ${currentAmount} Colony Ant to the ${countryName} Colony!`);
				setTransactionStatus(`You have successfully contributed ${currentAmount} Colony Ant to the ${countryName} Colony at  ${new Date().toLocaleTimeString()}!`);
				await fetchAndSetContributions(colonyMap);
			} catch (error) {
				console.error('Full error object:', JSON.stringify(error, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
				if (!handleUserRejection(error)) {
					if (error.code === "CALL_EXCEPTION") {
						setError('Transaction execution failed. Please check if you\'ve hit your hourly limit, or try again later.');
					} else {
						setError('Contribution failed: ' + (error.message || 'Unknown reason'));
					}
				}
				setTransactionStatus('');
			}
		} else {
			alert('Please connect your wallet first!');
			setTransactionStatus('');
		}	
	};

	const handleMouseEnter = (e) => {
		const countryCode = e.target.feature.properties['ISO_A2'];
		const country = countryData[countryCode] || { name: "Unknown", contributions: 0 };
		const contributions = countryContributions[countryCode] || "0";
		setTooltipContent(`
		<div>
			<strong>${country.name || e.target.feature.properties.name}</strong><br />
			Contributions: ${Math.floor(ethers.formatUnits(contributions, 18)) || 0}
		</div>`
		);
	};

	const handleMapMouseLeave = () => {
		setTooltipContent('');
	};

	const colorScale = scaleSequential(interpolateReds)
    	.domain([minContribution, maxContribution]);
	
	const onEachCountry = (country, layer) => {
		const countryCode = country.properties['ISO_A2'];
		const contributions = countryContributions[countryCode] || 0;
		const contributionAmount = Math.floor(ethers.formatUnits(contributions, 18));

		layer.setStyle({
			fillColor: contributionAmount === 0 ? '#808080' : colorScale(contributionAmount),
			weight: 0.5,
			opacity: 1,
			color: '#000',
			fillOpacity: 1
		});

		layer.on({
			click: (e) => {
			console.log('Country clicked:', country.properties['ISO_A2']);
			debouncedHandleCountryClick(e, contributionAmountRef.current);
			},
			mouseover: (e) => {
            if (loading) {
                layer.bindTooltip("Loading contributions...", { className: 'country-label' }).openTooltip(e.latlng);
            } else {
                handleMouseEnter(e);
                layer.bindTooltip(() => {
                    const country = countryData[countryCode] || { name: "Unknown", contributions: 0 };
                    const contributions = countryContributions[countryCode] || "0";
                    return `
                        <div>
                            <strong>${country.name || country.properties.name}</strong><br />
                            Colony Size: ${Math.floor(ethers.formatUnits(contributions, 18)) || 0} Ants
                        </div>`;
                }, { className: 'country-label' }).openTooltip(e.latlng);
            }
			},
			mouseout: (e) => {
				handleMapMouseLeave();
				layer.closeTooltip();
			}
	  	});

		layer.on('mouseover', () => {
			layer.setStyle({
				weight: 2,
			});
		  });
  
		layer.on('mouseout', () => {
			layer.setStyle({
				weight: .5,
			});
		});
	};
		  
	const walletInstructions = (
		<div className="wallet-instructions">
			<p><strong>To Get Started with Colony Ants:</strong></p>
			<ol>
				<li><strong>Connect Your Wallet:</strong> Ensure you have MetaMask installed and connected by clicking the "Connect Wallet" button above.</li>
				<li><strong>Add NEOX Chain to MetaMask:</strong> Visit the <a href="https://xexplorer.neo.org/token/0xA1d38A4D326b0317a8f20B53A1510c389299ffa5" target="_blank" rel="noopener noreferrer">NeoX Block Explorer</a>, scroll to the bottom left of the page, and click on "Add NEOX Chain".</li>
				<li><strong>Add Colony Ant Token:</strong> On the same NeoX Block Explorer page, click on the  "Add token to MetaMask" button (the MetaMask Fox) next to the Colony Ant contract address.</li>
				<li><strong>Get Colony Ants:</strong> A faucet to distribute Colony Ants is still in the works — until then, tag us in an X post @ColonyAntsHQ with your NeoX address for some free Colony Ants! </li>
			</ol>
		</div>
	);

	return (
		<div className="page-container">
			<div className="sidebar">
				<button onClick={connectWallet}>{isWalletConnected ? "Wallet Connected" : "Connect Wallet"}</button>
			<div className="wallet-instructions"> {walletInstructions} </div>
			<div className="contributions-display">
				{loading ? (
				<p>Loading contributions...</p>
				) : (
				<div>
					{connected && Object.keys(nonZeroContributions).length > 0 ? (
					<div>
						<h3>Top {Object.keys(nonZeroContributions).length} Largest Colonies:</h3>
						<ul>
						{Object.entries(nonZeroContributions).map(([code, amount]) => (
							<li key={code}>
							{countryData[code] ? countryData[code].name : code}: {Math.floor(ethers.formatUnits(amount, 18))} Colony Ants
							</li>
						))}
						</ul>
					</div>
					) : ( <p>{connected ? "No contributions data available." : "Please connect your wallet to view the top colonies."}</p>
					)}
				</div>
				)}
			</div>
      </div>

	  <div className="map-container">
	  <Tooltip id="map-tooltip" html={true}>{tooltipContent}</Tooltip>
	  	<div className="header-with-image">
			<img src={colonyAntImage} alt="Colony ant" className="ant-image" />
	  		<h1>Colony Ants Season: 0</h1>
			<h2>Contribute Ants to Build a Colony, and Battle for Glory!</h2>
			<img src={colonyAntImage} alt="Colony ant" className="ant-image" />
		</div>
		{error && (
            <div className="error-message">{error}</div>
            )}
		{transactionStatus && (
			<div className="loading-message">
				{transactionStatus} 
				{!transactionStatus.includes("successfully contributed") && <span className="spinner"></span>}			</div>
		)}
        <p>
			Click on the map to contribute <input
			type="number"
			value={ContributionAmount}
			onChange={(e) => {
				let value = e.target.value;
				if (value === '' || (Number(value) >= 1 && Number(value) <= 1)) {
				setContributionAmount(value);
				contributionAmountRef.current = value;
				}
			}}
			min="1"
			max="1"
			step="1"
			placeholder="1"/>  
			(Limit: 1/hour) Ant to a Colony!
        </p>
		{loading ? (
                <p>Loading Map...</p>
            ) : (
                <>
        {geographyData ? (
			<MapContainer center={[0, 0]} zoom={2} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'/>
            <GeoJSON data={geographyData} onEachFeature={onEachCountry} />

			<div className="legend" style={{
				position: 'absolute',
				bottom: '10px',
				left: '10px',
				background: 'white',
				padding: '10px',
				border: '1px solid #ccc',
				borderRadius: '5px',
				zIndex: 1000
			}}>
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<div style={{ fontSize: '12px', marginBottom: '5px' }}>Largest Colony</div>
			<div 
				style={{ 
				background: `linear-gradient(to bottom, ${colorScale(maxContribution)}, ${colorScale(minContribution)})`,
				width: '20px',
				height: '100px',
				marginBottom: '5px'
				}} />
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>Smallest Colony</div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ backgroundColor: '#808080', width: '20px', height: '20px', marginRight: '5px' }}></div>
                      <span style={{ fontSize: '12px' }}>No Colony</span>
                    </div>
                  </div>
                </div>
			</MapContainer>
        ) : (
          <p>Loading map data...</p>
        )}
		</>
		)}
      </div>
    </div>
);
};

export default Map;
