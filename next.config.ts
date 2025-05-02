import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: "/:path*", // ✅ Frontend API Route
        destination: "https://watch-and-earn-production.up.railway.app/:path*", // ✅ Backend ka Railway URL
      },
    ];
  },
};

export default nextConfig;
