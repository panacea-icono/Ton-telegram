/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.panas.app',
          },
        ],
        destination: 'https://panas.app/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
