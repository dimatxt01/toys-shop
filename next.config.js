/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // This is needed to make the static export work with API routes
  // It will create a static JSON file for each API route
  trailingSlash: true,
};

module.exports = nextConfig;