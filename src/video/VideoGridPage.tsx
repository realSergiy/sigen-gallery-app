'use client';

import { Tags } from '@/tag';
import { PATH_VIDEO_GRID } from '@/site/paths';
import VideoGridSidebar from './VideoGridSidebar';
import VideoGridContainer from './VideoGridContainer';
import { useEffect } from 'react';
import { useAppState } from '@/state/AppState';
import { Video } from '@/db/video_orm';

export default function VideoGridPage({
  videos,
  videosCount,
  tags,
}: {
  videos: Video[];
  videosCount: number;
  tags: Tags;
}) {
  const { setSelectedVideoIds } = useAppState();

  useEffect(() => () => setSelectedVideoIds?.(undefined), [setSelectedVideoIds]);

  return (
    <VideoGridContainer
      cacheKey={`page-${PATH_VIDEO_GRID}`}
      videos={videos}
      count={videosCount}
      sidebar={
        <div className="sticky top-4 mt-[-4px] space-y-4">
          <VideoGridSidebar
            {...{
              tags,
              videosCount,
            }}
          />
        </div>
      }
      canSelect
    />
  );
}
