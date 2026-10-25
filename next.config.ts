import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8084",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8084",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "sprofile.line-scdn.net",
      },
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
      },
    ],
  },
};

export default nextConfig;
