/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["typeorm", "mysql2", "reflect-metadata"],
  },
};

module.exports = nextConfig;
