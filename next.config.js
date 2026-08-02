/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Required: three.js is an ESM package — Next.js needs to transpile
     it to CommonJS for the server bundler. Used by lib/tunnel.ts and
     the TARS widget in the FAQ section.                              */
  transpilePackages: ["three"],
};

module.exports = nextConfig;
