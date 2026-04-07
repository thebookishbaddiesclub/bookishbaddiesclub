import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optionnellement, on force la détection de la racine si besoin, 
  // mais une réinstallation propre devrait déjà beaucoup aider.
  experimental: {
    // Si Turbopack continue à chercher à la racine utilisateur, on peut être plus restrictif ici
  }
};

export default nextConfig;
