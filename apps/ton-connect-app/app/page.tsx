"use client";

import { TonConnectButton } from '@tonconnect/ui-react';
import WalletActions from '../components/WalletActions';
import MediaPlaceholders from '../components/MediaPlaceholders';

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <img src="/logo.svg" width={28} height={28} alt="Panacea" />
          <h1>Panacea TON Wallet</h1>
        </div>
        <TonConnectButton className="connect" />
      </header>

      <section className="card">
        <h2>Acciones de Wallet</h2>
        <p>Conéctate y prueba firma de mensajes y una transferencia simple de TON.</p>
        <WalletActions />
      </section>

      <section className="card media">
        <h2>Medios: Logo, Regalos (GIFs) y Video Logo</h2>
        <p>Espacios para tu contenido visual: logo principal, animaciones de regalo y video logo. Reemplaza los archivos en <code>/public</code>.</p>
        <MediaPlaceholders />
        <div className="ph-hint">
          Archivos esperados: <code>hero.jpg</code> (imagen principal), <code>gift1.gif</code>, <code>gift2.gif</code> (regalos animados), <code>video-logo.mp4</code> (logo en video)
        </div>
      </section>

      <footer className="footer">
        <span>Personalizable: logo, colores, textos y flujos DeFi/Pagos.</span>
      </footer>
    </main>
  );
}
