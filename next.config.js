/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure route groups are handled correctly
  experimental: {
    // This helps with route group handling in production builds
  },
}

module.exports = nextConfig
