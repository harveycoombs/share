import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: false
    },
    productionBrowserSourceMaps: false
};

export default nextConfig;