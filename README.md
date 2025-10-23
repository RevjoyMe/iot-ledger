# Real-Time IoT Ledger 📡 - Логистика на MegaETH

## 🎯 Концепция

**IoT Ledger** — это B2B решение для логистики. Логистическая компания оборудует свои грузовики IoT-устройствами (например, Raspberry Pi) с кошельками MegaETH. Каждые 10 секунд каждое устройство автоматически отправляет транзакцию со своими GPS-координатами и температурой рефрижератора в смарт-контракт. Клиенты (например, супермаркеты) получают доступ к read-only дашборду, который в **реальном времени** показывает движение их груза на карте.

## 🚀 Почему MegaETH?

**Высокая пропускная способность** MegaETH позволяет записывать данные с тысяч IoT-устройств одновременно. **10ms блоки** обеспечивают мгновенное подтверждение транзакций. Клиент может отслеживать свой груз на карте, которая обновляется **мгновенно**, получая данные не с сервера компании, а прямо из **неизменяемого блокчейна**.

## 📝 Deployed Contract

- **Contract Name**: IoTLedgerContract
- **Address**: `0x3D17192112E7B298cE5F7F27cb41963E96B89411`
- **Network**: MegaETH Testnet
- **Explorer**: https://megaexplorer.xyz/address/0x3D17192112E7B298cE5F7F27cb41963E96B89411

## 🏗️ Архитектура

### Smart Contract (IoTLedgerContract.sol)

**Ключевые структуры:**
```solidity
struct DataPoint {
    uint64 timestamp;
    int32 lat;  // Latitude * 1e6
    int32 lon;  // Longitude * 1e6
    int16 temp; // Temperature * 10 (Celsius)
}
```

**State:**
```solidity
mapping(address => bool) public authorizedDevices;
mapping(bytes32 => DataPoint[]) public shipmentHistory;
mapping(address => bytes32) public deviceToShipment;
```

**Основные функции:**
- `authorizeDevice(address device, bytes32 shipmentId)` - авторизовать IoT-устройство (owner only)
- `submitData(int32 lat, int32 lon, int16 temp)` - отправить данные (вызывается устройством)
- `getShipmentDataCount(bytes32 shipmentId)` - количество записей (view)
- `getShipmentData(bytes32 shipmentId, uint256 index)` - получить запись (view)

**События:**
```solidity
event DataSubmitted(bytes32 indexed shipmentId, address indexed device, uint64 timestamp, int32 lat, int32 lon, int16 temp);
event DeviceAuthorized(address indexed device, bytes32 indexed shipmentId);
```

## 💻 Tech Stack

### Backend (IoT Device)
- **Hardware**: Raspberry Pi / ESP32 с GPS модулем и температурным датчиком
- **Software**: Python с web3.py или Node.js с viem
- **Interval**: Отправка данных каждые 10 секунд

### Frontend (Client Dashboard)
- **Framework**: React + Next.js, TypeScript
- **Map**: Leaflet.js или Mapbox
- **Charts**: Chart.js или Recharts
- **Blockchain**: wagmi, viem
- **Network**: MegaETH Testnet

## 🚚 User Flows

### 1. Setup (Logistics Company)
1. Компания деплоит контракт
2. Регистрирует IoT-устройства: `authorizeDevice(0xDevice123..., "SHIPMENT-001")`
3. Устанавливает устройства в грузовики
4. Настраивает Python-скрипт для автоматической отправки данных

### 2. IoT Device Loop (Автоматический)

```python
# Python script on Raspberry Pi
import time
import gps
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://rpc.megaeth.xyz'))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

while True:
    # Read GPS
    latitude = get_gps_latitude()  # e.g., 40.7128
    longitude = get_gps_longitude()  # e.g., -74.0060
    
    # Read temperature sensor
    temperature = get_temperature()  # e.g., -18.5 Celsius
    
    # Convert to contract format
    lat_int = int(latitude * 1e6)  # 40712800
    lon_int = int(longitude * 1e6)  # -74006000
    temp_int = int(temperature * 10)  # -185
    
    # Submit to blockchain
    tx = contract.functions.submitData(lat_int, lon_int, temp_int).transact({
        'from': DEVICE_WALLET,
        'gas': 100000
    })
    
    w3.eth.wait_for_transaction_receipt(tx)
    print(f"Data submitted: {latitude}, {longitude}, {temperature}°C")
    
    time.sleep(10)  # Wait 10 seconds
```

### 3. Client Dashboard (Real-time Tracking)
1. Клиент открывает URL: `iot-dashboard.vercel.app/track/SHIPMENT-001`
2. Видит карту с маркером грузовика
3. Видит график температуры
4. **MegaETH Realtime API** автоматически обновляет карту каждые 10 секунд

## 🔥 Уникальные Фичи

1. **Immutable Proof**: Все GPS-точки и температуры записаны on-chain → невозможно подделать
2. **Real-time Updates**: Клиент видит движение груза **мгновенно** (через Realtime API)
3. **No Intermediary**: Данные идут напрямую из IoT → Blockchain → Client
4. **High Throughput**: MegaETH может обрабатывать тысячи устройств одновременно

## 📊 Use Cases

- **Холодная Цепь**: Контроль температуры для фармацевтики/продуктов
- **Proof of Delivery**: Доказательство того, что груз был в нужном месте в нужное время
- **Insurance Claims**: Неизменяемые данные для страховых случаев
- **Compliance**: Автоматическое соответствие регуляторным требованиям

## 🛠️ Local Development

```bash
npm install
npm run compile
npm run deploy  # уже задеплоено!
```

## 📚 Документация

См. [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) для инструкций по деплою дашборда на Vercel.

---

**Built with ❤️ for MegaETH Hackathon**

