import type { NextConfig } from 'next';

// Allow switching between SSR (default) and static export "output: 'export'" via env
// Set NEXT_OUTPUT=export for static snapshot builds; omit for full SSR.
const isExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? '1' : '',
  },
  ...(isExport ? { output: 'export' } : {}),
};

export default nextConfig;
