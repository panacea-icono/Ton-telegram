import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MultiWallet from './components/MultiWallet';
import TONWallet from './components/TONWallet';
import Analytics from './pages/Analytics';
import Bots from './pages/Bots';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { BotProvider } from './services/BotContext';

function App() {
  return (
    <BotProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/wallet" element={<TONWallet />} />
            <Route path="/multi-wallet" element={<MultiWallet />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </BotProvider>
  );
}

export default App;
