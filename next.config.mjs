/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['dl.dropboxusercontent.com', 'www.dropbox.com'],
    unoptimized: process.env.NODE_ENV === 'production', // For Netlify deployment
  },
  // Using the latest Next.js features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.netlify.app', '*.netlify.com'],
    },
  },
  // For Netlify
  output: 'standalone',
};

export default nextConfig; 