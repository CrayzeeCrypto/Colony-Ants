import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import ColonyAntABI from './/contracts/ColonyAnt.json';
import ColonyMapABI from './/contracts/ColonyMap.json';

const provider = new Web3Provider(window.ethereum);
const signer = provider.getSigner();

const colonyAnt = new ethers.Contract("0x58eb07f482C3d4c524c25D0A5bD22F44AdB7396D", ColonyAntABI.abi, signer);
const colonyMap = new ethers.Contract("0x1aEC70C1BCB65A0Cde00fF1a6c5d348761363D99", ColonyMapABI.abi, signer);

export { colonyAnt, colonyMap };