import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'assets.literal.club',
        },
        {
            protocol: 'https',
            hostname: 'github.com',
        },
        ],
    },
    async headers() {
        return [
        {
            source: "/(.*)",
            headers: [
            {
                key: "X-Content-Type-Options",
                value: "nosniff",
            },
            {
                key: "X-Frame-Options",
                value: "DENY",
            },
            {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
            },
            {
                key: "X-XSS-Protection",
                value: "1; mode=block",
            },
            {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
            },
            ],
        },
        {
            source: "/api/(.*)",
            headers: [
            {
                key: "Cache-Control",
                value: "public, s-maxage=3600, stale-while-revalidate=60",
            },
            ],
        },
        ];
    },
};

export default nextConfig;
