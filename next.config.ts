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
  // The route used to be spelled "cancelation-policy" (one L). That folder was
  // a dead alias with no inbound links, so it has been deleted — redirect the
  // old URL here so any bookmark or external link still lands correctly.
  async redirects() {
    return [
      {
        source: "/:locale/cancelation-policy",
        destination: "/:locale/cancellation-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
