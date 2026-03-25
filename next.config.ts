import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the higher-quality setting used by Card thumbnails.
    qualities: [75, 90],
  },
};

export default nextConfig;
