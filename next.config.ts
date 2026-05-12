import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Contentful CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "downloads.ctfassets.net",
      },
    ],
  },

};

export default nextConfig;
