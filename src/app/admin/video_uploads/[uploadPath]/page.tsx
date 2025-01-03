import { PATH_ADMIN } from '@/site/paths';
import { extractVideoDataFromBlobPath } from '@/video/server';
import { redirect } from 'next/navigation';
import { getUniqueTagsCached } from '@/video/cache';
import UploadPageClient from '@/video/UploadPageClient';
import { GENERATE_RESIZED_IMAGE } from '@/site/config';

export const maxDuration = 60;

interface Params {
  params: Promise<{ uploadPath: string }>;
}

export default async function VideoUploadPage(props: Params) {
  const params = await props.params;

  const { uploadPath } = params;

  const { blobId, videoFormData, imageThumbnailBase64 } = await extractVideoDataFromBlobPath(
    uploadPath,
    {
      generateResizedImage: GENERATE_RESIZED_IMAGE,
    },
  );

  if (!videoFormData) {
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
