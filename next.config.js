/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Required: three.js is an ESM package — Next.js needs to transpile
     it (and its R3F ecosystem) to CommonJS for the server bundler.   */
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

module.exports = nextConfig;
