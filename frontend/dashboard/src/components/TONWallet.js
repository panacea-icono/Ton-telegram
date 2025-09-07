import {
    Check,
    Copy,
    ExternalLink,
    RefreshCw,
    Send,
    Shield,
    Wallet,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

const TONWallet = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.0000');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    message: ''
  });

  // Simular conexión de billetera
  const connectWallet = async () => {
    setLoading(true);
    try {
      // Simular conexión con Telegram Wallet
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar dirección simulada
      const address = 'UQ' + Math.random().toString(36).substr(2, 46);
      setWalletAddress(address);
      setWalletConnected(true);

      // Obtener balance simulado
      await getBalance(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalance = async (address) => {
    try {
      // Simular obtención de balance
      const simulatedBalance = (Math.random() * 100).toFixed(4);
      setBalance(simulatedBalance);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const sendTON = async () => {
    if (!sendForm.to || !sendForm.amount) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      // Simular envío de TON
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mostrar resultado
      alert(`Transacción enviada exitosamente!\nHash: tx_${Math.random().toString(36).substr(2, 9)}`);

      // Limpiar formulario
      setSendForm({ to: '', amount: '', message: '' });

      // Actualizar balance
      await getBalance(walletAddress);
    } catch (error) {
      console.error('Error sending TON:', error);
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

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setBalance('0.0000');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">TON Wallet</h2>
          <p className="text-gray-600">Gestiona tu billetera TON de Telegram</p>
        </div>
        <div className="flex items-center space-x-3">
          {walletConnected && (
            <button
              onClick={() => getBalance(walletAddress)}
              className="btn-outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Wallet Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${walletConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Wallet className={`h-6 w-6 ${walletConnected ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {walletConnected ? 'Billetera Conectada' : 'Billetera Desconectada'}
              </h3>
              <p className="text-sm text-gray-600">
                {walletConnected ? 'Conectada a Telegram Wallet' : 'Conecta tu billetera para empezar'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {walletConnected ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {!walletConnected ? (
        /* Connect Wallet */
        <div className="card">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conectar Billetera TON
            </h3>
            <p className="text-gray-600 mb-6">
              Conecta tu billetera TON de Telegram para gestionar tus fondos y realizar transacciones
            </p>
            <button
              onClick={connectWallet}
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
                  Conectar con Telegram Wallet
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Wallet Connected */
        <>
          {/* Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Balance</h3>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {balance} TON
                </div>
                <p className="text-sm text-gray-600">
                  ≈ ${(parseFloat(balance) * 2.5).toFixed(2)} USD
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
                    {walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => window.open(`https://tonscan.org/address/${walletAddress}`, '_blank')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver en TONScan
                </button>
              </div>
            </div>
          </div>

          {/* Send TON */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Enviar TON</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Dirección de destino</label>
                <input
                  type="text"
                  value={sendForm.to}
                  onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                  className="input"
                  placeholder="UQ..."
                />
              </div>
              <div>
                <label className="label">Cantidad (TON)</label>
                <input
                  type="number"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  className="input"
                  placeholder="0.0"
                  step="0.001"
                  min="0"
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
                  onClick={sendTON}
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
                      Enviar TON
                    </>
                  )}
                </button>
                <button
                  onClick={disconnectWallet}
                  className="btn-outline"
                >
                  Desconectar
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Aviso de Seguridad</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta es una demostración. En producción, las transacciones se firmarían localmente
                  y se enviarían a través de la red TON real.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TONWallet;
