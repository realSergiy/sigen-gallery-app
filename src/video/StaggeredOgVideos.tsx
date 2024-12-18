'use client';

import { useCallback, useEffect, useState } from 'react';
import VideoOGTile, { OGLoadingState } from './VideoOGTile';
import { Video } from '@/db/video_orm';

const DEFAULT_MAX_CONCURRENCY = 3;

type VideoLoadingState = Record<string, OGLoadingState>;

export default function StaggeredOgVideos({
  videos,
  maxConcurrency = DEFAULT_MAX_CONCURRENCY,
  onLastVideoVisible,
}: {
  videos: Video[];
  maxConcurrency?: number;
  onLastVideoVisible?: () => void;
}) {
  const [loadingState, setLoadingState] = useState(
    videos.reduce(
      (acc, video) => ({
        ...acc,
        [video.id]: 'unloaded' as const,
      }),
      {} as VideoLoadingState,
    ),
  );

  const recomputeLoadingState = useCallback(
    (updatedState: VideoLoadingState = {}) =>
      setLoadingState(currentLoadingState => {
        const initialLoadingState = {
          ...currentLoadingState,
          ...updatedState,
        };
        const updatedLoadingState = {
          ...currentLoadingState,
          ...updatedState,
        };

        let imagesLoadingCount = 0;
        Object.entries(initialLoadingState).forEach(([id, state]) => {
          if (state === 'loading') {
            imagesLoadingCount++;
          } else if (imagesLoadingCount < maxConcurrency && state === 'unloaded') {
            updatedLoadingState[id] = 'loading';
            imagesLoadingCount++;
          }
        });

        return updatedLoadingState;
      }),
    [maxConcurrency],
  );

  useEffect(() => {
    recomputeLoadingState();
  }, [recomputeLoadingState]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video, index) => (
        <VideoOGTile
          key={video.id}
          video={video}
          loadingState={loadingState[video.id]}
          onLoad={() => recomputeLoadingState({ [video.id]: 'loaded' })}
          onFail={() => recomputeLoadingState({ [video.id]: 'failed' })}
          onVisible={index === videos.length - 1 ? onLastVideoVisible : undefined}
          riseOnHover
        />
      ))}
    </div>
  );
}
