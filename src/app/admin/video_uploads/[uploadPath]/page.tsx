import { PATH_ADMIN } from '@/site/paths';
import { extractVideoDataFromBlobPath } from '@/video/server';
import { redirect } from 'next/navigation';
import { getUniqueTagsCached } from '@/video/cache';
import UploadPageClient from '@/video/UploadPageClient';
import { GENERATE_RESIZED_IMAGE } from '@/site/config';

export const maxDuration = 60;

interface Params {
  params: { uploadPath: string };
}

export default async function VideoUploadPage({ params: { uploadPath } }: Params) {
  const { blobId, videoFormData, imageThumbnailBase64 } = await extractVideoDataFromBlobPath(
    uploadPath,
    {
      generateResizedImage: GENERATE_RESIZED_IMAGE,
    },
  );

  if (!videoFormData || !imageThumbnailBase64) {
    redirect(PATH_ADMIN);
  }

  const uniqueTags = await getUniqueTagsCached();

  return (
    <UploadPageClient
      {...{
        blobId,
        videoFormData,
        uniqueTags,
        imageThumbnailBase64,
      }}
    />
  );
}
