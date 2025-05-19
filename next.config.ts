import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: false
    },
    productionBrowserSourceMaps: false,
    swcMinify: true
};

export default nextConfig;