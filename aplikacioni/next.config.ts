import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: (networkInterfaces()["Wi-Fi"] ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address),
};

export default nextConfig;
