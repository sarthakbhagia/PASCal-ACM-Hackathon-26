/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: '/home/hsrkl/Projects/PASC-Hackathon-26',
  },
}

export default nextConfig
