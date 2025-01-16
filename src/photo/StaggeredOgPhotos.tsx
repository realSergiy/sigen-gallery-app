'use client';

import { useCallback, useEffect, useState } from 'react';
import { Photo } from '@/photo';
import PhotoOGTile, { OGLoadingState } from './PhotoOGTile';

const DEFAULT_MAX_CONCURRENCY = 3;

type PhotoLoadingState = Record<string, OGLoadingState>;

export default function StaggeredOgPhotos({
  photos,
  maxConcurrency = DEFAULT_MAX_CONCURRENCY,
  onLastPhotoVisible,
}: {
  photos: Photo[];
  maxConcurrency?: number;
  onLastPhotoVisible?: () => void;
}) {
  const [loadingState, setLoadingState] = useState<PhotoLoadingState>(
    Object.fromEntries(photos.map(photo => [photo.id, 'unloaded' as const])),
  );

  const recomputeLoadingState = useCallback(
    (updatedState: PhotoLoadingState = {}) =>
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
        for (const [id, state] of Object.entries(initialLoadingState)) {
          if (state === 'loading') {
            imagesLoadingCount++;
          } else if (imagesLoadingCount < maxConcurrency && state === 'unloaded') {
            updatedLoadingState[id] = 'loading';
            imagesLoadingCount++;
          }
        }

        return updatedLoadingState;
      }),
    [maxConcurrency],
  );

  useEffect(() => {
    recomputeLoadingState();
  }, [recomputeLoadingState]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <PhotoOGTile
          key={photo.id}
          photo={photo}
          loadingState={loadingState[photo.id]}
          onLoad={() => recomputeLoadingState({ [photo.id]: 'loaded' })}
          onFail={() => recomputeLoadingState({ [photo.id]: 'failed' })}
          onVisible={index === photos.length - 1 ? onLastPhotoVisible : undefined}
          riseOnHover
        />
      ))}
    </div>
  );
}
