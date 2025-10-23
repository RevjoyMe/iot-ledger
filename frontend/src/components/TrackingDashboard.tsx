import { useState } from 'react'
import { useAccount, useWatchContractEvent, useWriteContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { stringToHex } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig'
import './TrackingDashboard.css'

interface DataPoint {
  timestamp: number
  lat: number
  lon: number
  temp: number
}

export default function TrackingDashboard() {
  const { address, isConnected } = useAccount()
  const [shipmentId, setShipmentId] = useState('SHIP-001')
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [deviceAddress, setDeviceAddress] = useState('')
  
  const { writeContract, isPending } = useWriteContract()
  
  // Watch for new data submissions
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'DataSubmitted',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { timestamp, lat, lon, temp } = log.args
        setDataPoints(prev => [...prev, {
          timestamp: Number(timestamp),
          lat: Number(lat) / 1e6,
          lon: Number(lon) / 1e6,
          temp: Number(temp) / 10
        }])
      })
    },
  })
  
  const handleAuthorizeDevice = () => {
    if (!deviceAddress) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'authorizeDevice',
      args: [deviceAddress as `0x${string}`, stringToHex(shipmentId, { size: 32 })],
    })
  }
  
  const handleSubmitData = () => {
    // Simulate device data (in real app, this would come from IoT device)
    const lat = Math.floor((40.7128 + (Math.random() - 0.5) * 0.01) * 1e6)
    const lon = Math.floor((-74.0060 + (Math.random() - 0.5) * 0.01) * 1e6)
    const temp = Math.floor((-18 + (Math.random() - 0.5) * 2) * 10)
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitData',
      args: [lat, lon, temp],
    })
  }
  
  const latestPoint = dataPoints[dataPoints.length - 1]
  
  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Shipment Tracking</h2>
        <ConnectButton />
      </div>
      
      {!isConnected ? (
        <div className="connect-prompt">
          <h3>Connect Your Wallet</h3>
          <p>Connect to view and manage shipments</p>
        </div>
      ) : (
        <>
          <div className="tracking-grid">
            <div className="map-section">
              <h3>📍 Live Location</h3>
              <div className="map-placeholder">
                {latestPoint ? (
                  <div className="location-display">
                    <div className="coordinates">
                      <strong>Current Position:</strong>
                      <p>Lat: {latestPoint.lat.toFixed(6)}</p>
                      <p>Lon: {latestPoint.lon.toFixed(6)}</p>
                    </div>
                    <div className="marker">📍</div>
                    <p className="last-update">
                      Last update: {new Date(latestPoint.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <p>No tracking data yet. Submit data to start tracking.</p>
                )}
              </div>
            </div>
            
            <div className="stats-section">
              <h3>🌡️ Temperature Monitor</h3>
              <div className="temp-display">
                <div className="temp-value">
                  {latestPoint ? `${latestPoint.temp.toFixed(1)}°C` : '--'}
                </div>
                {latestPoint && latestPoint.temp > -15 && (
                  <div className="temp-warning">⚠️ Temperature Warning!</div>
                )}
              </div>
              
              <div className="data-points">
                <h4>Recent Data Points ({dataPoints.length})</h4>
                <div className="points-list">
                  {dataPoints.slice(-5).reverse().map((point, i) => (
                    <div key={i} className="point-item">
                      <span>{new Date(point.timestamp * 1000).toLocaleTimeString()}</span>
                      <span>{point.temp.toFixed(1)}°C</span>
                    </div>
                  ))}
                  {dataPoints.length === 0 && (
                    <p className="no-data">No data submitted yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="controls-section">
            <div className="control-card">
              <h3>🔧 Device Management</h3>
              <input
                type="text"
                placeholder="Device Address (0x...)"
                value={deviceAddress}
                onChange={(e) => setDeviceAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Shipment ID"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
              />
              <button onClick={handleAuthorizeDevice} disabled={isPending || !deviceAddress}>
                {isPending ? 'Authorizing...' : 'Authorize Device'}
              </button>
            </div>
            
            <div className="control-card">
              <h3>📤 Submit Data (Demo)</h3>
              <p className="demo-info">
                Simulates IoT device submitting GPS + temperature data
              </p>
              <button onClick={handleSubmitData} disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Sample Data'}
              </button>
            </div>
            
            <div className="info-card">
              <h3>⚡ Real-time Features</h3>
              <ul>
                <li>✅ 10ms block confirmations</li>
                <li>✅ Live position updates</li>
                <li>✅ Temperature monitoring</li>
                <li>✅ Immutable audit trail</li>
                <li>✅ Cold chain compliance</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

