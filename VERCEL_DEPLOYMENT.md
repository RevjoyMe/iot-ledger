# 🚀 Vercel Deployment Guide - IoT Ledger Dashboard

## 📋 Contract Info

- **Contract**: IoTLedgerContract
- **Address**: `0x3D17192112E7B298cE5F7F27cb41963E96B89411`
- **Network**: MegaETH Testnet
- **Purpose**: Real-time IoT tracking for logistics

## 🏗️ Frontend Structure (Client Dashboard)

```
iot-ledger/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveMap.tsx          # Leaflet.js map
│   │   │   ├── LiveChart.tsx        # Temperature chart
│   │   │   └── ShipmentInfo.tsx     # Shipment details
│   │   ├── hooks/
│   │   │   └── useShipmentTracker.ts  # ⚡ Realtime tracking
│   │   ├── pages/
│   │   │   └── track/[shipmentId].tsx  # Dynamic tracking page
│   │   └── contractInfo.ts
│   └── next.config.js
└── vercel.json
```

## 📄 vercel.json

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "installCommand": "cd frontend && npm install"
}
```

## 🎨 Frontend Implementation

### 1. Contract Info (contractInfo.ts)

```typescript
export const IOT_LEDGER_ADDRESS = "0x3D17192112E7B298cE5F7F27cb41963E96B89411";
export const IOT_LEDGER_ABI = [
  "function authorizeDevice(address device, bytes32 shipmentId) external",
  "function submitData(int32 lat, int32 lon, int16 temp) external",
  "function getShipmentDataCount(bytes32 shipmentId) external view returns (uint256)",
  "function getShipmentData(bytes32 shipmentId, uint256 index) external view returns (tuple(uint64 timestamp, int32 lat, int32 lon, int16 temp))",
  "event DataSubmitted(bytes32 indexed shipmentId, address indexed device, uint64 timestamp, int32 lat, int32 lon, int16 temp)",
  "event DeviceAuthorized(address indexed device, bytes32 indexed shipmentId)"
];
```

### 2. 🔥 Shipment Tracker Hook (useShipmentTracker.ts)

```typescript
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem, encodeBytes32String } from 'viem';
import { IOT_LEDGER_ADDRESS, IOT_LEDGER_ABI } from '../contractInfo';

const megaETH = {
  id: 654321,
  name: 'MegaETH',
  rpcUrls: { default: { http: ['https://rpc.megaeth.xyz'] } }
};

interface DataPoint {
  timestamp: number;
  lat: number;
  lon: number;
  temp: number;
}

export function useShipmentTracker(shipmentId: string) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const client = createPublicClient({
      chain: megaETH,
      transport: http()
    });
    
    const shipmentIdBytes = encodeBytes32String(shipmentId);
    
    // 1. Load historical data
    async function loadHistory() {
      const count = await client.readContract({
        address: IOT_LEDGER_ADDRESS,
        abi: IOT_LEDGER_ABI,
        functionName: 'getShipmentDataCount',
        args: [shipmentIdBytes]
      }) as bigint;
      
      const points: DataPoint[] = [];
      for (let i = 0; i < Number(count); i++) {
        const data = await client.readContract({
          address: IOT_LEDGER_ADDRESS,
          abi: IOT_LEDGER_ABI,
          functionName: 'getShipmentData',
          args: [shipmentIdBytes, BigInt(i)]
        }) as any;
        
        points.push({
          timestamp: Number(data.timestamp),
          lat: Number(data.lat) / 1e6,
          lon: Number(data.lon) / 1e6,
          temp: Number(data.temp) / 10
        });
      }
      
      setDataPoints(points);
      setLoading(false);
    }
    
    loadHistory();
    
    // 2. Subscribe to real-time updates
    const unwatch = client.watchEvent({
      address: IOT_LEDGER_ADDRESS,
      event: parseAbiItem('event DataSubmitted(bytes32 indexed shipmentId, address indexed device, uint64 timestamp, int32 lat, int32 lon, int16 temp)'),
      args: { shipmentId: shipmentIdBytes },
      onLogs(logs) {
        logs.forEach(log => {
          const { timestamp, lat, lon, temp } = log.args as any;
          
          setDataPoints(prev => [...prev, {
            timestamp: Number(timestamp),
            lat: Number(lat) / 1e6,
            lon: Number(lon) / 1e6,
            temp: Number(temp) / 10
          }]);
        });
      }
    });
    
    return () => unwatch();
  }, [shipmentId]);
  
  return { dataPoints, loading };
}
```

### 3. Live Map Component (LiveMap.tsx)

```typescript
'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  dataPoints: Array<{ lat: number, lon: number }>;
}

export function LiveMap({ dataPoints }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('map').setView([40.7128, -74.0060], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);
    }
  }, []);
  
  useEffect(() => {
    if (!mapRef.current || dataPoints.length === 0) return;
    
    const latestPoint = dataPoints[dataPoints.length - 1];
    
    // Update marker
    if (markerRef.current) {
      markerRef.current.setLatLng([latestPoint.lat, latestPoint.lon]);
    } else {
      markerRef.current = L.marker([latestPoint.lat, latestPoint.lon], {
        icon: L.icon({
          iconUrl: '/truck-icon.png',
          iconSize: [40, 40]
        })
      }).addTo(mapRef.current);
    }
    
    // Update route polyline
    const route = dataPoints.map(p => [p.lat, p.lon] as [number, number]);
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(route);
    } else {
      polylineRef.current = L.polyline(route, { color: 'blue' }).addTo(mapRef.current);
    }
    
    // Pan map to latest position
    mapRef.current.panTo([latestPoint.lat, latestPoint.lon]);
    
  }, [dataPoints]);
  
  return <div id="map" style={{ width: '100%', height: '500px' }} />;
}
```

### 4. Live Chart Component (LiveChart.tsx)

```typescript
'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  dataPoints: Array<{ timestamp: number, temp: number }>;
}

export function LiveChart({ dataPoints }: Props) {
  const data = {
    labels: dataPoints.map(p => new Date(p.timestamp * 1000).toLocaleTimeString()),
    datasets: [{
      label: 'Temperature (°C)',
      data: dataPoints.map(p => p.temp),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Real-time Temperature Monitoring'
      }
    },
    scales: {
      y: {
        min: -25,
        max: 5,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };
  
  return <Line data={data} options={options} />;
}
```

### 5. Tracking Page (track/[shipmentId].tsx)

```typescript
'use client';
import { useParams } from 'next/navigation';
import { useShipmentTracker } from '../../hooks/useShipmentTracker';
import { LiveMap } from '../../components/LiveMap';
import { LiveChart } from '../../components/LiveChart';

export default function TrackingPage() {
  const { shipmentId } = useParams();
  const { dataPoints, loading } = useShipmentTracker(shipmentId as string);
  
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading shipment data...</h2>
        <p>Syncing with MegaETH blockchain...</p>
      </div>
    );
  }
  
  const latestPoint = dataPoints[dataPoints.length - 1];
  
  return (
    <div className="tracking-dashboard">
      <header>
        <h1>📦 Shipment Tracking: {shipmentId}</h1>
        <div className="status">
          <span className="live-indicator">🔴 LIVE</span>
          <span>Last Update: {new Date(latestPoint.timestamp * 1000).toLocaleString()}</span>
        </div>
      </header>
      
      <div className="dashboard-grid">
        <div className="map-section">
          <h2>📍 Location</h2>
          <LiveMap dataPoints={dataPoints} />
          <div className="coordinates">
            Current: {latestPoint.lat.toFixed(6)}, {latestPoint.lon.toFixed(6)}
          </div>
        </div>
        
        <div className="chart-section">
          <h2>🌡️ Temperature</h2>
          <LiveChart dataPoints={dataPoints} />
          <div className="current-temp">
            Current: {latestPoint.temp.toFixed(1)}°C
            {latestPoint.temp > -15 && (
              <span className="warning">⚠️ Temperature Warning!</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Data Points</h3>
          <p>{dataPoints.length}</p>
        </div>
        <div className="stat-card">
          <h3>Distance Traveled</h3>
          <p>{calculateDistance(dataPoints)} km</p>
        </div>
        <div className="stat-card">
          <h3>Avg Temperature</h3>
          <p>{calculateAvgTemp(dataPoints)}°C</p>
        </div>
      </div>
    </div>
  );
}

function calculateDistance(points: any[]) {
  // Haversine formula implementation
  return "123"; // Placeholder
}

function calculateAvgTemp(points: any[]) {
  const sum = points.reduce((acc, p) => acc + p.temp, 0);
  return (sum / points.length).toFixed(1);
}
```

## 🌐 Environment Variables

```
NEXT_PUBLIC_IOT_LEDGER_ADDRESS=0x3D17192112E7B298cE5F7F27cb41963E96B89411
NEXT_PUBLIC_MEGAETH_RPC=https://rpc.megaeth.xyz
NEXT_PUBLIC_CHAIN_ID=654321
```

## 📦 Package.json

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-chartjs-2": "^5.2.0",
    "chart.js": "^4.4.0",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.0"
  }
}
```

## 🚀 Deployment

1. Push to GitHub
2. Import to Vercel
3. Add Environment Variables
4. Deploy!

## ✅ Testing

1. Open dashboard: `/track/SHIPMENT-001`
2. See historical route and temperature
3. Wait 10 seconds → New data point appears!
4. Map smoothly pans to new location
5. Chart updates with new temperature

---

**Track with Confidence! 📡**

