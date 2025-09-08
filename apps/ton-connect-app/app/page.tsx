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
        <h2>Medios: Imágenes y GIFs</h2>
        <p>Espacios reservados para tu contenido visual. Reemplaza los archivos en <code>/public</code> o edita las URLs.</p>
        <MediaPlaceholders />
        <div className="ph-hint">Sugerencia: coloca archivos en <code>apps/ton-connect-app/public</code> por ejemplo: <code>hero.jpg</code>, <code>gif1.gif</code>, <code>gif2.gif</code>.</div>
      </section>

      <footer className="footer">
        <span>Personalizable: logo, colores, textos y flujos DeFi/Pagos.</span>
      </footer>
    </main>
  );
}
