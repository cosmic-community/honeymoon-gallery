/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgix.cosmicjs.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cosmicjs.com',
      },
    ],
  },
}

module.exports = nextConfig