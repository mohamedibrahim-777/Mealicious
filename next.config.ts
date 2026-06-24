import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.mealicious.store",
      },
    ],
  },
  // Security headers — applied to every response (malware/clickjacking/XSS hardening)
  async headers() {
    return [
      // Immutable long-cache for hashed static assets (perf / Core Web Vitals)
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Service worker must always revalidate
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://sdk.cashfree.com https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://*.facebook.com https://api.cashfree.com https://sandbox.cashfree.com https://sdk.cashfree.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
              "frame-src 'self' https://sdk.cashfree.com https://*.cashfree.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
