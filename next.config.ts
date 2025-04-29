import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Redirect all API calls to your backend
  async rewrites() {
    return [
      {
        source: "/api/:path*", // All requests to /api/* on frontend
        destination: "https://watch-and-earn-production.up.railway.app/api/:path*", // Goes to your backend
      },
    ];
  },
};

export default nextConfig;
