import { Camera } from '@/camera';
import CameraShareModal from '@/camera/CameraShareModal';
import { generateMetaForCamera } from '@/camera/meta';
import { Metadata } from 'next/types';
import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import { getPhotosCameraDataCached } from '@/camera/data';
import CameraOverview from '@/camera/CameraOverview';
import { cache } from 'react';

const getPhotosCameraDataCachedCached = cache((make: string, model: string) =>
  getPhotosCameraDataCached(make, model, INFINITE_SCROLL_GRID_INITIAL),
);

type CameraPageProps = {
  params: Promise<Camera>;
};

export async function generateMetadata({ params }: CameraPageProps): Promise<Metadata> {
  const { make, model } = await params;

  const [photos, { count, dateRange }, camera] = await getPhotosCameraDataCachedCached(make, model);

  const { url, title, description, images } = generateMetaForCamera(
    camera,
    photos,
    count,
    dateRange,
  );

  return {
    title,
    openGraph: {
      title,
      description,
      images,
      url,
    },
    twitter: {
      images,
      description,
      card: 'summary_large_image',
    },
    description,
  };
}

export default async function Share({ params }: CameraPageProps) {
  const { make, model } = await params;

  const [photos, { count, dateRange }, camera] = await getPhotosCameraDataCachedCached(make, model);

  return (
    <>
      <CameraShareModal {...{ camera, photos, count, dateRange }} />
      <CameraOverview {...{ camera, photos, count, dateRange }} animateOnFirstLoadOnly />
    </>
  );
}
