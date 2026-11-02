import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@selaras/shared'],
  reactStrictMode: true,
};

export default nextConfig;
