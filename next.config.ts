import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/libquery_engine-rhel-openssl-3.0.x.so.node"],
  },
};

export default nextConfig;
