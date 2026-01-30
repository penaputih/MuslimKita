
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/proxy/equran/:path*',
        destination: 'https://equran.id/api/:path*',
      },
    ];
  },
};

export default nextConfig;
