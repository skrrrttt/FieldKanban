import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // PWA-specific headers for proper MIME types and caching
  headers: async () => [
    {
      source: "/manifest.json",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json",
        },
      ],
    },
    {
      source: "/:path*.png",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
