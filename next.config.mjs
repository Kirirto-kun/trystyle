/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hmonline.ru',
        pathname: '/pictures/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebase.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.firebase.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
