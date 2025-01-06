import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const VERCEL_BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z0-9]+)_[a-z0-9]+$/i,
)?.[1].toLowerCase();

const HOSTNAME_VERCEL_BLOB = VERCEL_BLOB_STORE_ID
  ? `${VERCEL_BLOB_STORE_ID}.public.blob.vercel-storage.com`
  : undefined;

const HOSTNAME_CLOUDFLARE_R2 = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;

const HOSTNAME_AWS_S3 =
  process.env.NEXT_PUBLIC_AWS_S3_BUCKET && process.env.NEXT_PUBLIC_AWS_S3_REGION
    ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com`
    : undefined;

const createRemotePattern = (hostname: string | undefined): RemotePattern[] =>
  hostname
    ? [
        {
          protocol: 'https',
          hostname,
          port: '',
          pathname: '/**',
        },
      ]
    : [];

const nextConfig: NextConfig = {
  images: {
    imageSizes: [200],
    remotePatterns: [
      ...createRemotePattern(HOSTNAME_VERCEL_BLOB),
      ...createRemotePattern(HOSTNAME_CLOUDFLARE_R2),
      ...createRemotePattern(HOSTNAME_AWS_S3),
    ],
    minimumCacheTTL: 31536000,
  },
};

export default bundleAnalyzer(nextConfig);
