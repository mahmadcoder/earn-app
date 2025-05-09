import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      // Proxy only login and register requests to backend
      {
        source: '/login',
        destination: 'http://localhost:3001/login',
      },
      {
        source: '/register',
        destination: 'http://localhost:3001/register',
      },
    ];
  },
};

export default nextConfig;
