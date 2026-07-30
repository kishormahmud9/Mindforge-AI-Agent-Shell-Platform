/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage standalone builds
  output: 'standalone',

  // Allow images from backend domain
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
  },

  // Suppress ESLint during production builds (lint separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
