import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Si Turbopack continue à chercher à la racine utilisateur, on peut être plus restrictif ici
  }
};

export default nextConfig;
