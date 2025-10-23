// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IoTLedger
 * @dev Real-time IoT tracking on MegaETH
 */
contract IoTLedgerContract is Ownable {
    struct DataPoint {
        uint64 timestamp;
        int32 lat;
        int32 lon;
        int16 temp;
    }
    
    mapping(address => bool) public authorizedDevices;
    mapping(bytes32 => DataPoint[]) public shipmentHistory;
    mapping(address => bytes32) public deviceToShipment;
    
    event DataSubmitted(bytes32 indexed shipmentId, address indexed device, uint64 timestamp, int32 lat, int32 lon, int16 temp);
    event DeviceAuthorized(address indexed device, bytes32 indexed shipmentId);
    
    constructor() Ownable(msg.sender) {}
    
    function authorizeDevice(address device, bytes32 shipmentId) external onlyOwner {
        authorizedDevices[device] = true;
        deviceToShipment[device] = shipmentId;
        emit DeviceAuthorized(device, shipmentId);
    }
    
    function submitData(int32 lat, int32 lon, int16 temp) external {
        require(authorizedDevices[msg.sender], "Unauthorized");
        
        bytes32 shipmentId = deviceToShipment[msg.sender];
        
        DataPoint memory data = DataPoint({
            timestamp: uint64(block.timestamp),
            lat: lat,
            lon: lon,
            temp: temp
        });
        
        shipmentHistory[shipmentId].push(data);
        
        emit DataSubmitted(shipmentId, msg.sender, uint64(block.timestamp), lat, lon, temp);
    }
    
    function getShipmentDataCount(bytes32 shipmentId) external view returns (uint256) {
        return shipmentHistory[shipmentId].length;
    }
    
    function getShipmentData(bytes32 shipmentId, uint256 index) external view returns (DataPoint memory) {
        require(index < shipmentHistory[shipmentId].length, "Index out of bounds");
        return shipmentHistory[shipmentId][index];
    }
}

