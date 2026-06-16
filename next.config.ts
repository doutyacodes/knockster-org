import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/invitations',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
