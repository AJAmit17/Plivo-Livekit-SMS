import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_LIVEKIT_URL: process.env.LIVEKIT_URL,
  },
};

export default nextConfig;
