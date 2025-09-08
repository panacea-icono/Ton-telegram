"use client";

import { ReactNode, useMemo } from 'react';
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';

export default function TonConnectProvider({ children }: { children: ReactNode }) {
  const manifestUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/tonconnect-manifest.json';
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${base}/tonconnect-manifest.json`;
  }, []);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: THEME.DARK }}
      actionsConfiguration={{
        twaReturnUrl: (process.env.NEXT_PUBLIC_TWA_RETURN_URL as `${string}://${string}` | undefined),
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
