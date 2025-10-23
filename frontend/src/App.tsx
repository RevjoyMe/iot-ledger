import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './wagmi'
import TrackingDashboard from './components/TrackingDashboard'
import '@rainbow-me/rainbowkit/styles.css'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="app">
            <header>
              <div className="header-content">
                <h1>📡 IoT Ledger</h1>
                <p className="subtitle">Real-time tracking on-chain</p>
                <div className="badge">Live Updates • MegaETH</div>
              </div>
            </header>
            
            <main>
              <TrackingDashboard />
            </main>
            
            <footer>
              <p>Built on MegaETH • Contract: 0x3D17192112E7B298cE5F7F27cb41963E96B89411</p>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

