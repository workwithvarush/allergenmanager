import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  redirects() {
    return [
      // A venue's home is its dashboard.
      { source: "/venues/:venueId", destination: "/venues/:venueId/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
