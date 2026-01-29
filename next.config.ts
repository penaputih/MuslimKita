import type { NextConfig } from "next";

// Force restart for Prisma Schema update
const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  }
};

export default nextConfig;
