import {
  INFINITE_SCROLL_FEED_INITIAL,
  INFINITE_SCROLL_GRID_INITIAL,
  generateOgImageMetaForVideos,
} from '@/video';

import { Metadata } from 'next/types';
import { cache } from 'react';

import { GRID_HOMEPAGE_ENABLED } from '@/site/config';

import VideoGridPage from '@/video/VideoGridPage';
import VideoFeedPage from '@/video/VideoFeedPage';
import { getVideos, getVideosMeta } from '@/db/video_orm';
import { getVideoSidebarData } from '@/video/data';
import MediaEmptyState from '@/media/MediaEmptyState';

export const dynamic = 'force-static';
export const maxDuration = 60;

const getVideosCached = cache(() =>
  getVideos({
    limit: GRID_HOMEPAGE_ENABLED ? INFINITE_SCROLL_GRID_INITIAL : INFINITE_SCROLL_FEED_INITIAL,
  }),
);

export async function generateMetadata(): Promise<Metadata> {
  const videos = await getVideosCached().catch(() => []);
  return generateOgImageMetaForVideos(videos);
}

export default async function HomePage() {
  const [videos, videosCount, tags, cameras, simulations] = await Promise.all([
    getVideosCached().catch(() => []),
    getVideosMeta({})
      .then(({ count }) => count)
      .catch(() => 0),
    ...(GRID_HOMEPAGE_ENABLED ? getVideoSidebarData() : [[], [], []]),
  ]);

  return videos.length > 0 ? (
    GRID_HOMEPAGE_ENABLED ? (
      <VideoGridPage {...{ videos, videosCount, tags, cameras, simulations }} />
    ) : (
      <VideoFeedPage {...{ videos, videosCount }} />
    )
  ) : (
    <MediaEmptyState message="Add your first video:" />
  );
}
