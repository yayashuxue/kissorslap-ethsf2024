import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/**", // You can add a more specific path here if necessary
      },
    ],
    domains: ["storage.googleapis.com"], // Whitelist storage.googleapis.com
  },
  reactStrictMode: true, // Enable React strict mode for improved error handling
  swcMinify: true, // Enable SWC minification for improved performance
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL, // Use a single environment variable
  },
};


export default withPWA({
  dest: "public", // destination directory for the PWA files
  disable: process.env.NODE_ENV === "development", // disable PWA in the development environment
  register: process.env.NODE_ENV !== "development", // Register service worker only in production
  skipWaiting: true, // skip waiting for service worker activation
  buildExcludes: [/app-build-manifest\.json$/],
})(nextConfig);
