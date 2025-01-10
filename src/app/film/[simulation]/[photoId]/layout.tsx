import { RELATED_GRID_PHOTOS_TO_SHOW, descriptionForPhoto, titleForPhoto } from '@/photo';
import { Metadata } from 'next/types';
import { redirect } from 'next/navigation';
import { PATH_ROOT, absolutePathForPhoto, absolutePathForPhotoImage } from '@/site/paths';
import PhotoDetailPage from '@/photo/PhotoDetailPage';
import { ReactNode, cache } from 'react';
import { FilmSimulation } from '@/simulation';
import { getPhotosMetaCached, getPhotosNearIdCached } from '@/photo/cache';

const getPhotosNearIdCachedCached = cache((photoId: string, simulation: FilmSimulation) =>
  getPhotosNearIdCached(photoId, {
    simulation,
    limit: RELATED_GRID_PHOTOS_TO_SHOW + 2,
  }),
);

type PhotoFilmSimulationProps = {
  params: Promise<{ photoId: string; simulation: FilmSimulation }>;
};

export async function generateMetadata(props: PhotoFilmSimulationProps): Promise<Metadata> {
  const params = await props.params;

  const { photoId, simulation } = params;

  const { photo } = await getPhotosNearIdCachedCached(photoId, simulation);

  if (!photo) {
    return {};
  }

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo);
  const images = absolutePathForPhotoImage(photo);
  const url = absolutePathForPhoto({ photo, simulation });

  return {
    title,
    description,
    openGraph: {
      title,
      images,
      description,
      url,
    },
    twitter: {
      title,
      description,
      images,
      card: 'summary_large_image',
    },
  };
}

export default async function PhotoFilmSimulationPage(
  props: PhotoFilmSimulationProps & { children: ReactNode },
) {
  const params = await props.params;

  const { photoId, simulation } = params;

  const { children } = props;

  const { photo, photos, photosGrid, indexNumber } = await getPhotosNearIdCachedCached(
    photoId,
    simulation,
  );

  if (!photo) {
    redirect(PATH_ROOT);
  }

  const { count, dateRange } = await getPhotosMetaCached({ simulation });

  return (
    <>
      {children}
      <PhotoDetailPage
        {...{
          photo,
          photos,
          photosGrid,
          simulation,
          indexNumber,
          count,
          dateRange,
        }}
      />
    </>
  );
}
