import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const localBackendPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i;
    const backendUrl =
      process.env.NODE_ENV === "development" && !localBackendPattern.test(configuredUrl ?? "")
        ? "http://localhost:5000"
        : configuredUrl;

    if (!backendUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is required.");
    return [{
      source: "/api/:path*",
      destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
    }];
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
