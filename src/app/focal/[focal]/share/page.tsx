import { generateMetaForFocalLength, getFocalLengthFromString } from '@/focal';
import FocalLengthOverview from '@/focal/FocalLengthOverview';
import FocalLengthShareModal from '@/focal/FocalLengthShareModal';
import { getPhotosFocalLengthDataCached } from '@/focal/data';
import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import type { Metadata } from 'next';
import { cache } from 'react';

const getPhotosFocalLengthDataCachedCached = cache((focal: number) =>
  getPhotosFocalLengthDataCached({
    focal,
    limit: INFINITE_SCROLL_GRID_INITIAL,
  }),
);

interface FocalLengthProps {
  params: Promise<{ focal: string }>;
}

export async function generateMetadata(props: FocalLengthProps): Promise<Metadata> {
  const params = await props.params;

  const { focal: focalString } = params;

  const focal = getFocalLengthFromString(focalString);

  const [photos, { count, dateRange }] = await getPhotosFocalLengthDataCachedCached(focal);

  const { url, title, description, images } = generateMetaForFocalLength(
    focal,
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

export default async function Share(props: FocalLengthProps) {
  const params = await props.params;

  const { focal: focalString } = params;

  const focal = getFocalLengthFromString(focalString);

  const [photos, { count, dateRange }] = await getPhotosFocalLengthDataCachedCached(focal);

  return (
    <>
      <FocalLengthShareModal {...{ focal, photos, count, dateRange }} />
      <FocalLengthOverview {...{ focal, photos, count, dateRange }} animateOnFirstLoadOnly />
    </>
  );
}
