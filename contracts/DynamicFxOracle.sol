// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

contract DynamicFxOracle {

    address public admin;

    mapping(address => uint256) public priceARS;

    mapping(address => uint8) public tokenDecimals;
    mapping(address => bool) public hasPrice;

    bool public active = true;
    uint256 public lastUpdated;

    event PriceUpdated(address indexed token, uint256 newPrice, uint256 timestamp);

    constructor(address _admin){
        require(_admin != address(0), "admin=0");
        admin = _admin;
        lastUpdated = block.timestamp;
    }

    function quote(address token, uint256 amountARS) external view returns(uint256){
        require(active, "oracle paused");
        require(hasPrice[token], "price not set");
        require(amountARS > 0, "amount=0");

        uint256 price = priceARS[token];      
        uint8 dec = tokenDecimals[token];  

        return (amountARS * (10 ** dec)) / price;
    }

    function setPrice(address token, uint256 humanPrice) external {
        require(msg.sender == admin, "not admin");
        require(token != address(0), "token=0");
        require(humanPrice > 0, "price=0");

        if(!hasPrice[token]) {
            tokenDecimals[token] = IERC20Metadata(token).decimals();
            hasPrice[token] = true;
        }

        priceARS[token] = humanPrice;
        lastUpdated = block.timestamp;

        emit PriceUpdated(token, humanPrice, block.timestamp);
    }

    function pause() external {
        require(msg.sender == admin, "not admin");
        active = false;
    }

    function unpause() external {
        require(msg.sender == admin, "not admin");
        active = true;
    }
}
