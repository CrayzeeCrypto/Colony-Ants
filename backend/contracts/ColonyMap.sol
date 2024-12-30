// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ColonyMap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public colonyAnt;
    mapping(string => uint256) public contributions; // Total contributions for each country
	mapping(address => uint256) public lastContribution; // Last contribution time for user

    uint256 public constant MIN_CONTRIBUTION = 1 * (10 ** 18);

	event Contribution(address indexed contributor, string countryCode, uint256 amount, uint256 timestamp);
	event TokensWithdrawn(address indexed to, uint256 amount, string indexed countryCode);	
	event BattleConcluded(string indexed attacker, string indexed defender, string winner);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        colonyAnt = IERC20(_tokenAddress);
    }

	mapping(address => string) public contributorCountry;

    function contribute(string memory _countryCode, uint256 _amount) public nonReentrant {
		require(_amount == MIN_CONTRIBUTION, "Contribution must be 1 whole Colony Ant");
		require(block.timestamp > lastContribution[msg.sender] + 1 hours, "Hourly limit not reset");

		colonyAnt.safeTransferFrom(msg.sender, address(this), _amount);
		contributions[_countryCode] = contributions[_countryCode] + _amount;
		lastContribution[msg.sender] = block.timestamp;

		contributorCountry[msg.sender] = _countryCode;
		
		emit Contribution(msg.sender, _countryCode, _amount, block.timestamp);
	}
	
	function battle(string memory _attacker, string memory _defender) public onlyOwner {
		require(contributions[_attacker] > 0 && contributions[_defender] > 0, "Both countries must have contributions");

		uint256 attackerWeight = contributions[_attacker];
		uint256 defenderWeight = contributions[_defender];
		uint256 totalWeight = attackerWeight + defenderWeight;

		uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.number, msg.sender))) % totalWeight;

		string memory winner;
		if (randomNumber < attackerWeight) {
			winner = _attacker;
		} else {
			winner = _defender;
		}

		emit BattleConcluded(_attacker, _defender, winner);
		}
			
    function withdrawTokens(address _to, uint256 _amount, string[] memory _countryCodes) public onlyOwner nonReentrant {
        require(_amount <= colonyAnt.balanceOf(address(this)), "Insufficient balance");
        
        for (uint i = 0; i < _countryCodes.length; i++) {
        	contributions[_countryCodes[i]] = 0;
    	}
        
        colonyAnt.safeTransfer(_to, _amount);
        emit TokensWithdrawn(_to, _amount, "Multiple Countries");
    }

    function getCountryContributions(string memory _countryCode) public view returns (uint256) {
        return contributions[_countryCode];
    }
	
	function getLastContributionTime(address _contributor) public view returns (uint256) {
		return lastContribution[_contributor];
	}

    function getContributorCountry(address _contributor) public view returns (string memory) {
        return contributorCountry[_contributor];
    }
}