/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@drawspy/shared', '@drawspy/game-engine'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
