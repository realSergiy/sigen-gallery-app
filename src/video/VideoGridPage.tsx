'use client';

import { Tags } from '@/tag';
import { Video } from '.';
import { Cameras } from '@/camera';
import { FilmSimulations } from '@/simulation';
import { PATH_GRID } from '@/site/paths';
import VideoGridSidebar from './VideoGridSidebar';
import VideoGridContainer from './VideoGridContainer';
import { useEffect } from 'react';
import { useAppState } from '@/state/AppState';

export default function VideoGridPage({
  videos,
  videosCount,
  tags,
  cameras,
  simulations,
}: {
  videos: Video[];
  videosCount: number;
  tags: Tags;
  cameras: Cameras;
  simulations: FilmSimulations;
}) {
  const { setSelectedVideoIds } = useAppState();

  useEffect(
    () => () => setSelectedVideoIds?.(undefined),
    [setSelectedVideoIds],
  );

  return (
    <VideoGridContainer
      cacheKey={`page-${PATH_GRID}`}
      videos={videos}
      count={videosCount}
      sidebar={
        <div className="sticky top-4 mt-[-4px] space-y-4">
          <VideoGridSidebar
            {...{
              tags,
              cameras,
              simulations,
              videosCount,
            }}
          />
        </div>
      }
      canSelect
    />
  );
}
