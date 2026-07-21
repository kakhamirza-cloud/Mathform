import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
