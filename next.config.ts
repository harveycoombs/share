import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ hostname: "uploads.share.surf" }, { hostname: "cdn.discordapp.com" }, { hostname: "s.gravatar.com" }]
    }
};

export default nextConfig;