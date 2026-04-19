import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

// Only wrap with serwist in production builds. In dev, Next 16 uses Turbopack
// and serwist's webpack injection triggers a warning that halts dev startup.
// Service worker is disabled in dev anyway — this just avoids the wrapper.
const config =
  process.env.NODE_ENV === "production"
    ? withSerwistInit({
        swSrc: "src/app/sw.ts",
        swDest: "public/sw.js",
        cacheOnNavigation: true,
        reloadOnOnline: true,
      })(nextConfig)
    : nextConfig;

export default config;
