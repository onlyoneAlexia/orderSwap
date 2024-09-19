// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrderSwap {
    struct Order {
        address depositor;        // Address of the order creator
        uint256 amountDeposited;  // Amount of TokenA deposited
        address tokenDeposited;    // Address of TokenA
        address paymentToken;      // Address of the payment token (TokenB)
        uint256 price;             // Amount of TokenB required for the swap
        bool active;               // Order status
        uint256 deadline;          // Deadline for the order
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    // Custom errors
    error OrderNotActive();
    error InsufficientPayment();
    error InvalidAmount();
    error InvalidPrice();
    error NotOrderDepositor();
    error InvalidDeadline();
    error OrderExpired();

    function depositOrder(address _tokenDeposited, address _paymentToken, uint256 _amount, uint256 _price, uint256 _deadline) external {
        if (_amount == 0) revert InvalidAmount();
        if (_price == 0) revert InvalidPrice();
        if (_deadline <= block.timestamp) revert InvalidDeadline(); // Check for valid deadline

        IERC20(_tokenDeposited).transferFrom(msg.sender, address(this), _amount);
        orders[orderCount] = Order(msg.sender, _amount, _tokenDeposited, _paymentToken, _price, true, _deadline);
        orderCount++;
    }

    function purchaseOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        if (!order.active) revert OrderNotActive();
        if (block.timestamp > order.deadline) revert OrderExpired(); // Check if the order has expired
        
        // Transfer payment token from buyer to the contract
        IERC20(order.paymentToken).transferFrom(msg.sender, address(this), order.price);
        
        // Transfer TokenA from the contract to the buyer
        IERC20(order.tokenDeposited).transfer(msg.sender, order.amountDeposited);
        order.active = false; // Mark order as inactive after purchase
    }

    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        if (order.depositor != msg.sender) revert NotOrderDepositor();
        require(order.active, "Order already inactive");

        order.active = false; // Mark order as inactive
        IERC20(order.tokenDeposited).transfer(msg.sender, order.amountDeposited); // Transfer tokens back to depositor
    }

    function viewOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
}