/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Netlify
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Variables d'environnement
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Configuration pour les fonctions serverless
  experimental: {
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
