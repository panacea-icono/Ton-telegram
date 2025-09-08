"use client";

import { useCallback, useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

export default function WalletActions() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const connected = !!wallet;

  const [toAddress, setToAddress] = useState('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
  const [nanoTon, setNanoTon] = useState('10000000'); // 0.01 TON

  const disabled = !connected;

  const sendTon = useCallback(async () => {
    try {
      const tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: toAddress,
            amount: nanoTon,
          },
        ],
      };
      await tonConnectUI.sendTransaction(tx);
      alert('Transacción enviada (verifícala en tu wallet).');
    } catch (e: any) {
      console.error(e);
      alert('Error al enviar o acción cancelada.');
    }
  }, [nanoTon, toAddress, tonConnectUI]);

  const network = useMemo(() => wallet?.account?.chain || 'N/A', [wallet]);
  const address = useMemo(() => wallet?.account?.address || '—', [wallet]);

  return (
    <div>
      <div className="row" style={{ marginTop: 0 }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Estado</div>
          <div>{connected ? 'Conectado' : 'Desconectado'}</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Red</div>
          <div>{String(network)}</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Address</div>
          <div style={{ wordBreak: 'break-all', maxWidth: 380 }}>{address}</div>
        </div>
      </div>

      <div className="row">
        <input
          className="input"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Destino (address TON)"
          style={{ width: 420 }}
        />
        <input
          className="input"
          value={nanoTon}
          onChange={(e) => setNanoTon(e.target.value)}
          placeholder="Monto en nanotons (1 TON = 1e9)"
          style={{ width: 260 }}
        />
        <button className="btn" disabled={disabled} onClick={sendTon}>
          Enviar TON
        </button>
      </div>
    </div>
  );
}
