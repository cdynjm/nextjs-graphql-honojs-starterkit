import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    domains: [
      'uaktdanrls0dysal.public.blob.vercel-storage.com',
    ],
    unoptimized: true,
  },
  webpackDevMiddleware: (config: import('webpack').Configuration) => {
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 100,
    };
    return config;
  },
}

export default nextConfig;
