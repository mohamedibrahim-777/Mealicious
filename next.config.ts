import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "node_modules/typescript/**",
      "node_modules/@types/**",
      "node_modules/.cache/**",
      "node_modules/@swc/core-*/**",
      "node_modules/@esbuild/**",
      "node_modules/esbuild/**",
      "node_modules/eslint/**",
      "node_modules/eslint-*/**",
      "node_modules/prisma/**",
      "node_modules/@prisma/engines/**",
      "node_modules/@prisma/engines-version/**",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
