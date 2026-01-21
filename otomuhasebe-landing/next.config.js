/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // Optimize for production
  compress: true,
  // Note: swcMinify is default in Next.js 16, no need to specify
  // Note: Turbopack is opt-in via --turbo flag, so default is Webpack
}

module.exports = nextConfig
