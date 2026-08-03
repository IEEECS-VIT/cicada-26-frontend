/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Required: three.js is an ESM package — Next.js needs to transpile
     it to CommonJS for the server bundler. Used by lib/tunnel.ts and
     the TARS widget in the FAQ section.                              */
  transpilePackages: ["three"],
  /* The two source images are heavy JPEGs (891208.jpg is 733KB and the LCP;
     cicada_logo.jpg is 361KB rendered at 120x52). next/image already resizes
     to the `sizes` each one declares — declaring these formats lets it also
     re-encode, which is where most of the weight actually goes. */
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
