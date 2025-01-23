import { PATH_ADMIN } from '@/site/paths';
import { extractVideoMetaFromBlobPath } from '@/video/server';
import { redirect } from 'next/navigation';
import { getUniqueTagsCached } from '@/video/cache';
import UploadPageClient from '@/video/UploadPageClient';

export const maxDuration = 60;

type Params = {
  params: Promise<{ uploadPath: string }>;
};

export default async function VideoUploadPage(props: Params) {
  const params = await props.params;

  const { uploadPath } = params;

  const { blobId, videoFormData } = await extractVideoMetaFromBlobPath(uploadPath);

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
      }}
    />
  );
}
