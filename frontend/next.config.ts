import type { NextConfig } from "next";

/**
 * Hosts allowed to load Next.js dev resources (/_next/*, HMR) cross-origin.
 *
 * Next blocks these by default so other sites cannot read your dev server.
 * Set ALLOWED_DEV_ORIGINS (comma-separated) when you open the app from another
 * device on your LAN, e.g. ALLOWED_DEV_ORIGINS=192.168.1.20
 * This only affects `next dev` — production builds are unaffected.
 */
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

export default nextConfig;
