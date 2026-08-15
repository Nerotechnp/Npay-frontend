/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.npaynepal.com" },
    ],
  },
};

module.exports = nextConfig;
