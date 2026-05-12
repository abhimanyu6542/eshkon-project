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
  // Ensure releases dir is accessible at runtime on Vercel
  outputFileTracingIncludes: {
    "/api/publish/*": ["./releases/**/*"],
  },
};

export default nextConfig;
