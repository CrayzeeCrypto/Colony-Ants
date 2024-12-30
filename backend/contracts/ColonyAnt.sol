// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ColonyAnt is ERC20 {
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * (10 ** 18);

    constructor() ERC20("ColonyAnt", "CANT") {
        _mint(msg.sender, MAX_SUPPLY);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}