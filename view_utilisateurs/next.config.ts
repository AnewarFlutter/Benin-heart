import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  turbopack: {
    root: path.resolve(__dirname)
  },

  reactStrictMode: false,
  
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/photo/**',
      },
      // Etc...
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
 

  allowedDevOrigins: [
    'local-origin.dev',
    '*.local-origin.dev',
  ]
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
