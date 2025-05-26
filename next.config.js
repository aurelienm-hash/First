/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration optimisée pour Vercel
  images: {
    unoptimized: true,
  },
  // Variables d'environnement
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Configuration pour les API routes
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configuration pour les Server Actions (même si on n'en utilise pas)
  serverActions: {
    bodySizeLimit: "100mb",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
