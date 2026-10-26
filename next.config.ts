import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "pages-dsl-limits-additional.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  async rewrites() {
    const expenseApiUrl =
      process.env.INTERNAL_EXPENSE_API_URL || "http://127.0.0.1:8085/api/v1";
    return [
      {
        source: "/api/expense/:path*",
        destination: `${expenseApiUrl}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:8085/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8085",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8085",
        pathname: "/uploads/**",
      },
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
