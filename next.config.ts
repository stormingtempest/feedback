import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.15.41:3000'],
    },
  },
};

export default nextConfig;
