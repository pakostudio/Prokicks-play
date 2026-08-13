/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@mediapipe/pose': './lib/vision/mediapipeStub.js',
    },
  },
};
module.exports = nextConfig;
