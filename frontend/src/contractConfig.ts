export const CONTRACT_ADDRESS = '0x3D17192112E7B298cE5F7F27cb41963E96B89411'

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "shipmentId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "device",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "int32",
        "name": "lat",
        "type": "int32"
      },
      {
        "indexed": false,
        "internalType": "int32",
        "name": "lon",
        "type": "int32"
      },
      {
        "indexed": false,
        "internalType": "int16",
        "name": "temp",
        "type": "int16"
      }
    ],
    "name": "DataSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "device",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "shipmentId",
        "type": "bytes32"
      }
    ],
    "name": "DeviceAuthorized",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "device",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "shipmentId",
        "type": "bytes32"
      }
    ],
    "name": "authorizeDevice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedDevices",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "deviceToShipment",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "shipmentId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getShipmentData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "timestamp",
            "type": "uint64"
          },
          {
            "internalType": "int32",
            "name": "lat",
            "type": "int32"
          },
          {
            "internalType": "int32",
            "name": "lon",
            "type": "int32"
          },
          {
            "internalType": "int16",
            "name": "temp",
            "type": "int16"
          },
          {
            "internalType": "string",
            "name": "deviceId",
            "type": "string"
          }
        ],
        "internalType": "struct IoTLedgerContract.DataPoint",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "shipmentId",
        "type": "bytes32"
      }
    ],
    "name": "getShipmentDataCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int32",
        "name": "lat",
        "type": "int32"
      },
      {
        "internalType": "int32",
        "name": "lon",
        "type": "int32"
      },
      {
        "internalType": "int16",
        "name": "temp",
        "type": "int16"
      }
    ],
    "name": "submitData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

