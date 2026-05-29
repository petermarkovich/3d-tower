import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // StrictMode у dev монтує компоненти двічі — ламає DRACO WASM
  reactStrictMode: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    // нативний View Transitions API — кросфейд між сторінками
    viewTransition: true,
  },
};

export default nextConfig;
