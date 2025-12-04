import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ hostname: "uploads.share.surf" }]
    }
};

export default nextConfig;