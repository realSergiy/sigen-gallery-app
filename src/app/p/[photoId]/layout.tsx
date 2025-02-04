import { RELATED_GRID_PHOTOS_TO_SHOW, descriptionForPhoto, titleForPhoto } from '@/photo';
import { Metadata } from 'next/types';
import { redirect } from 'next/navigation';
import { PATH_ROOT, absolutePathForPhoto, absolutePathForPhotoImage } from '@/site/paths';
import PhotoDetailPage from '@/photo/PhotoDetailPage';
import { getPhotosNearIdCached } from '@/photo/cache';
import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PAGES } from '@/site/config';
import { getPhotoIds } from '@/photo/db/query';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/photo/db';
import { ReactNode, cache } from 'react';

export const maxDuration = 60;

const getPhotosNearIdCachedCached = cache((photoId: string) =>
  getPhotosNearIdCached(photoId, { limit: RELATED_GRID_PHOTOS_TO_SHOW + 2 }),
);

export let generateStaticParams: (() => Promise<{ photoId: string }[]>) | undefined;

if (STATICALLY_OPTIMIZED_PAGES && IS_PRODUCTION) {
  generateStaticParams = async () => {
    const photos = await getPhotoIds({ limit: GENERATE_STATIC_PARAMS_LIMIT });
    return photos.map(photoId => ({ photoId }));
  };
}

type PhotoProps = {
  params: Promise<{ photoId: string }>;
};

export async function generateMetadata(props: PhotoProps): Promise<Metadata> {
  const params = await props.params;

  const { photoId } = params;

  const { photo } = await getPhotosNearIdCachedCached(photoId);

  if (!photo) {
    return {};
  }

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo);
  const images = absolutePathForPhotoImage(photo);
  const url = absolutePathForPhoto({ photo });

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

export default async function PhotoPage(props: PhotoProps & { children: ReactNode }) {
  const params = await props.params;

  const { photoId } = params;

  const { children } = props;

  const { photo, photos, photosGrid } = await getPhotosNearIdCachedCached(photoId);

  if (!photo) {
    redirect(PATH_ROOT);
  }

  return (
    <>
      {children}
      <PhotoDetailPage {...{ photo, photos, photosGrid }} />
    </>
  );
}
