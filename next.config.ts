import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // Skip ESLint during production builds to avoid failing the build for dev-only lint rules
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
