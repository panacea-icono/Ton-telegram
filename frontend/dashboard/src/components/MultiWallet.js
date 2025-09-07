import React, { useState } from 'react';
import { 
  Wallet, 
  Send, 
  Copy, 
  Check, 
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
  Plus,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

const MultiWallet = () => {
  const [activeWallet, setActiveWallet] = useState('ton');
  const [wallets, setWallets] = useState({
    ton: { connected: false, address: '', balance: '0.0000' },
    phantom: { connected: false, address: '', balance: '0.0000' },
    pera: { connected: false, address: '', balance: '0.0000' },
    exodus: { connected: false, address: '', balance: '0.0000' }
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    message: ''
  });

  const walletConfig = {
    ton: {
      name: 'TON Wallet',
      icon: '🔹',
      currency: 'TON',
      color: 'blue',
      network: 'TON Mainnet',
      explorer: 'https://tonscan.org/address/'
    },
    phantom: {
      name: 'Phantom',
      icon: '🔸',
      currency: 'SOL',
      color: 'purple',
      network: 'Solana Mainnet',
      explorer: 'https://explorer.solana.com/address/'
    },
    pera: {
      name: 'Pera',
      icon: '🔹',
      currency: 'ALGO',
      color: 'green',
      network: 'Algorand Mainnet',
      explorer: 'https://algoexplorer.io/address/'
    },
    exodus: {
      name: 'Exodus',
      icon: '🔸',
      currency: 'BTC',
      color: 'orange',
      network: 'Bitcoin Mainnet',
      explorer: 'https://blockstream.info/address/'
    }
  };

  const connectWallet = async (type) => {
    setLoading(true);
    try {
      // Simular conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const address = generateAddress(type);
      const balance = (Math.random() * 100).toFixed(4);
      
      setWallets(prev => ({
        ...prev,
        [type]: {
          connected: true,
          address: address,
          balance: balance
        }
      }));
      
      setActiveWallet(type);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = (type) => {
    setWallets(prev => ({
      ...prev,
      [type]: {
        connected: false,
        address: '',
        balance: '0.0000'
      }
    }));
    
    if (activeWallet === type) {
      const connectedWallets = Object.entries(wallets).filter(([_, wallet]) => wallet.connected);
      setActiveWallet(connectedWallets.length > 0 ? connectedWallets[0][0] : 'ton');
    }
  };

  const sendTransaction = async () => {
    if (!sendForm.to || !sendForm.amount) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const config = walletConfig[activeWallet];
      alert(`Transacción ${config.currency} enviada exitosamente!\nHash: ${config.currency.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`);
      
      setSendForm({ to: '', amount: '', message: '' });
      
      // Actualizar balance
      const newBalance = (parseFloat(wallets[activeWallet].balance) - parseFloat(sendForm.amount)).toFixed(4);
      setWallets(prev => ({
        ...prev,
        [activeWallet]: {
          ...prev[activeWallet],
          balance: newBalance
        }
      }));
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Error enviando transacción');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAddress = (type) => {
    const prefixes = {
      ton: 'UQ',
      phantom: 'So',
      pera: 'ALGO',
      exodus: '1'
    };
    return prefixes[type] + Math.random().toString(36).substr(2, 46);
  };

  const getConnectedWallets = () => {
    return Object.entries(wallets).filter(([_, wallet]) => wallet.connected);
  };

  const getTotalBalance = () => {
    return Object.values(wallets)
      .filter(wallet => wallet.connected)
      .reduce((total, wallet) => total + parseFloat(wallet.balance), 0)
      .toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Wallet</h2>
          <p className="text-gray-600">Gestiona múltiples billeteras blockchain</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            {getConnectedWallets().length} de 4 billeteras conectadas
          </div>
        </div>
      </div>

      {/* Wallet Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Billeteras Disponibles</h3>
          <div className="text-sm text-gray-600">
            Balance Total: {getTotalBalance()} USD
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(walletConfig).map(([type, config]) => (
            <div
              key={type}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                activeWallet === type
                  ? 'border-blue-500 bg-blue-50'
                  : wallets[type].connected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveWallet(type)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span className="font-medium text-gray-900">{config.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  wallets[type].connected ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                {config.network}
              </div>
              
              {wallets[type].connected ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Balance: </span>
                    <span className="font-medium">{wallets[type].balance} {config.currency}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnectWallet(type);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    connectWallet(type);
                  }}
                  disabled={loading}
                  className="w-full text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Conectando...' : 'Conectar'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Wallet Details */}
      {wallets[activeWallet].connected ? (
        <>
          {/* Balance and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  {walletConfig[activeWallet].icon} {walletConfig[activeWallet].name}
                </h3>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {wallets[activeWallet].balance} {walletConfig[activeWallet].currency}
                </div>
                <p className="text-sm text-gray-600">
                  ≈ ${(parseFloat(wallets[activeWallet].balance) * 2.5).toFixed(2)} USD
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
              </div>
              <div className="py-4">
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-gray-100 p-2 rounded truncate">
                    {wallets[activeWallet].address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(wallets[activeWallet].address)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => window.open(`${walletConfig[activeWallet].explorer}${wallets[activeWallet].address}`, '_blank')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver en Explorer
                </button>
              </div>
            </div>
          </div>

          {/* Send Transaction */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Enviar {walletConfig[activeWallet].currency}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Dirección de destino</label>
                <input
                  type="text"
                  value={sendForm.to}
                  onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                  className="input"
                  placeholder="Ingresa la dirección de destino"
                />
              </div>
              <div>
                <label className="label">Cantidad ({walletConfig[activeWallet].currency})</label>
                <input
                  type="number"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  className="input"
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  max={wallets[activeWallet].balance}
                />
              </div>
              <div>
                <label className="label">Mensaje (opcional)</label>
                <input
                  type="text"
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  className="input"
                  placeholder="Mensaje para la transacción"
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={sendTransaction}
                  disabled={loading || !sendForm.to || !sendForm.amount}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar {walletConfig[activeWallet].currency}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSendForm({ to: '', amount: '', message: '' })}
                  className="btn-outline"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Connect Wallet */
        <div className="card">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">{walletConfig[activeWallet].icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conectar {walletConfig[activeWallet].name}
            </h3>
            <p className="text-gray-600 mb-6">
              Conecta tu billetera {walletConfig[activeWallet].name} para gestionar tus {walletConfig[activeWallet].currency}
            </p>
            <button
              onClick={() => connectWallet(activeWallet)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Conectar {walletConfig[activeWallet].name}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Aviso de Seguridad</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Esta es una demostración. En producción, las transacciones se firmarían localmente 
              y se enviarían a través de las redes blockchain reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiWallet;
