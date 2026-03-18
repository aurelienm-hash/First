/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
