import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.bazaarwale.in",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "image.uniqlo.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
    ],
    // Disable image optimization for localhost in development to avoid 400 errors
    // Images will be served directly without optimization
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
