import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },

  cacheComponents: false,

  async redirects() {
    return [
      {
        source: "/",
        destination: "/inicio",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;