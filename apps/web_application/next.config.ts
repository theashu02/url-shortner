import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  allowedDevOrigins: ["nonpresidential-lukas-postaxial.ngrok-free.dev"],
};

export default nextConfig;
