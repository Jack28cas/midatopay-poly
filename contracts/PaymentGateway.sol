// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns(uint256);
}

interface IOracle {
    function quote(address token, uint256 amountARS) external view returns(uint256);
}

contract PaymentGateway {

    mapping(bytes32 => bool) public processedPayments;

    address public admin;
    address public oracle;

    event PaymentProcessed(bytes32 indexed id, address merchant, address token, uint256 amount);

    constructor(address _admin, address _oracle){
        require(_admin != address(0), "admin=0");
        admin = _admin;
        oracle = _oracle;
    }

    function pay(
        address merchant,
        uint256 amountARS,
        address token,
        bytes32 paymentId
    ) external returns(bool){

        require(msg.sender == admin, "only admin");
        require(!processedPayments[paymentId], "already processed");

        uint256 amountToken = IOracle(oracle).quote(token, amountARS);
        require(amountToken > 0, "quote=0");
        require(IERC20(token).balanceOf(address(this)) >= amountToken, "not enough balance");

        require(IERC20(token).transfer(merchant, amountToken), "transfer failed");

        processedPayments[paymentId] = true;

        emit PaymentProcessed(paymentId, merchant, token, amountToken);

        return true;
    }
}
