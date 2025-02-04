'use client';

import { Tags } from '@/tag';
import { Photo } from '.';
import { Cameras } from '@/camera';
import { FilmSimulations } from '@/simulation';
import { PATH_PHOTO_GRID } from '@/site/paths';
import PhotoGridSidebar from './PhotoGridSidebar';
import PhotoGridContainer from './PhotoGridContainer';
import { useEffect } from 'react';
import { useAppState } from '@/state/AppState';

export default function PhotoGridPage({
  photos,
  photosCount,
  tags,
  cameras,
  simulations,
}: {
  photos: Photo[];
  photosCount: number;
  tags: Tags;
  cameras: Cameras;
  simulations: FilmSimulations;
}) {
  const { setSelectedPhotoIds } = useAppState();

  useEffect(() => () => setSelectedPhotoIds?.(undefined), [setSelectedPhotoIds]);

  return (
    <PhotoGridContainer
      cacheKey={`page-${PATH_PHOTO_GRID}`}
      photos={photos}
      count={photosCount}
      sidebar={
        <div className="sticky top-4 mt-[-4px] space-y-4">
          <PhotoGridSidebar
            {...{
              tags,
              cameras,
              simulations,
              photosCount,
            }}
          />
        </div>
      }
      canSelect
    />
  );
}
