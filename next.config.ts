import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  experimental: {
    cpus: 1,
    memoryBasedWorkersCount: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rentaltech.premiumasp.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rentall.runasp.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
