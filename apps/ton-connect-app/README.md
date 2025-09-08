Panacea TON Wallet (Vercel)

Resumen
- Next.js 14 (App Router) + `@tonconnect/ui-react`.
- Botón Connect, firma de mensajes y ejemplo de transferencia.
- Personalizable (logo, colores, textos) en `app/globals.css` y `public/tonconnect-manifest.json`.

Variables
- `NEXT_PUBLIC_SITE_URL`: URL pública (https) de tu despliegue para que el manifest tenga rutas absolutas.
- `NEXT_PUBLIC_TWA_RETURN_URL` (opcional): Deep link de retorno para mini apps de Telegram.

Dev
```
cd apps/ton-connect-app
npm install
npm run dev
```

Deploy Vercel (monorepo)
1) Crear proyecto en Vercel con Root Directory: `apps/ton-connect-app`.
2) Variables: definir `NEXT_PUBLIC_SITE_URL` con la URL del proyecto (por ejemplo, `https://<tu-project>.vercel.app`).
3) Build Command: `npm run build` (por defecto). Output: `.next` (por defecto).
4) Deploy.

Personalización rápida
- Logo: reemplaza `public/logo.svg` y actualiza `public/tonconnect-manifest.json` (`iconUrl` debe ser absoluta en producción: `https://…/logo.svg`).
- Colores: edita `app/globals.css` (variables CSS).
- Textos: edita `app/page.tsx`.

