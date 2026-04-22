// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MockVault {
    IERC20 public immutable token;
    
    struct Position {
        uint256 amount;
        string protocol;
        string strategy;
        uint256 timestamp;
    }
    
    mapping(address => Position[]) public userPositions;
    mapping(address => uint256) public totalDeposits;
    
    event Deposited(
        address indexed user, 
        uint256 amount, 
        string protocol, 
        string strategy,
        uint256 positionId
    );
    event Withdrawn(address indexed user, uint256 amount, uint256 positionId);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    function deposit(
        uint256 amount, 
        string calldata protocol, 
        string calldata strategy
    ) external returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(bytes(protocol).length > 0, "Protocol required");
        
        token.transferFrom(msg.sender, address(this), amount);
        
        Position memory newPosition = Position({
            amount: amount,
            protocol: protocol,
            strategy: strategy,
            timestamp: block.timestamp
        });
        
        userPositions[msg.sender].push(newPosition);
        totalDeposits[msg.sender] += amount;
        
        uint256 positionId = userPositions[msg.sender].length - 1;
        
        emit Deposited(msg.sender, amount, protocol, strategy, positionId);
        
        return positionId;
    }
    
    function withdraw(uint256 positionId) external {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        
        Position storage position = userPositions[msg.sender][positionId];
        require(position.amount > 0, "Position already withdrawn");
        
        uint256 amount = position.amount;
        position.amount = 0;
        totalDeposits[msg.sender] -= amount;
        
        token.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount, positionId);
    }
    
    function getPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
    
    function getPositionCount(address user) external view returns (uint256) {
        return userPositions[user].length;
    }
    
    function getTotalDeposit(address user) external view returns (uint256) {
        return totalDeposits[user];
    }
}
