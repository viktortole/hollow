import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization — required for static export.
  // Images are served as-is from /public.
  images: {
    unoptimized: true,
  },
  // Silence the lockfile detection warning — website/ has its own package-lock.json.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
