import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;

  const body = {
    url: origin,
    name: 'Panacea TON Wallet',
    iconUrl: `${origin}/logo.svg`,
    termsOfUseUrl: `${origin}/terms`,
    privacyPolicyUrl: `${origin}/privacy`,
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

