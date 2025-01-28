import { INFINITE_SCROLL_GRID_INITIAL, generateOgImageMetaForVideos } from '@/video';
import { Metadata } from 'next/types';
import { getVideoSidebarData } from '@/video/data';
import { cache } from 'react';
import VideoGridPage from '@/video/VideoGridPage';
import MediaEmptyState from '@/media/MediaEmptyState';
import { getVideosWithMasks, getVideosMeta } from '@/db/video_orm';

export const dynamic = 'force-static';

const getVideosCached = cache(() =>
  getVideosWithMasks({
    limit: INFINITE_SCROLL_GRID_INITIAL,
  }),
);

export async function generateMetadata(): Promise<Metadata> {
  const videos = await getVideosCached().catch(() => []);
  return generateOgImageMetaForVideos(videos);
}

export default async function GridPage() {
  const [videos, videosCount, tags] = await Promise.all([
    getVideosCached().catch(() => []),
    getVideosMeta({})
      .then(({ count }) => count)
      .catch(() => 0),
    ...getVideoSidebarData(),
  ]);

  return videos.length > 0 ? (
    <VideoGridPage {...{ videos, videosCount, tags }} data-testid="VideoGridPage" />
  ) : (
    <MediaEmptyState message="Add your first video:" />
  );
}
