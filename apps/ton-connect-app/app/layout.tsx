import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TonConnectProvider from '../components/TonConnectProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Panacea Wallet (TON) — Demo',
  description: 'Customizable TON wallet connect template for Panacea | Icono',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <TonConnectProvider>
          {children}
        </TonConnectProvider>
      </body>
    </html>
  );
}

