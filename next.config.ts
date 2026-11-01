import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage – replace YOUR_PROJECT_REF with your actual ref
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Enable server actions (required for form mutations)
    serverActions: {
      bodySizeLimit: "10mb", // Allow product image uploads via server actions
    },
  },
  // Enforce strict mode in React
  reactStrictMode: true,
};

export default nextConfig;
