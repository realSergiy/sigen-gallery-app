import { redirect } from 'next/navigation';
import { getVideoNoStore, getUniqueTagsCached } from '@/video/cache';
import { PATH_ADMIN } from '@/site/paths';
import VideoEditPageClient from '@/video/VideoEditPageClient';
import { AI_TEXT_GENERATION_ENABLED, BLUR_ENABLED } from '@/site/config';
import { blurImageFromUrl, resizeImageFromUrl } from '@/video/server';
import { getNextImageUrlForManipulation } from '@/services/next-image';

export default async function VideoEditPage({
  params: { videoId },
}: {
  params: { videoId: string };
}) {
  const video = await getVideoNoStore(videoId, true);

  if (!video) {
    redirect(PATH_ADMIN);
  }

  const uniqueTags = await getUniqueTagsCached();

  const hasAiTextGeneration = AI_TEXT_GENERATION_ENABLED;

  // Only generate image thumbnails when AI generation is enabled
  const imageThumbnailBase64 = AI_TEXT_GENERATION_ENABLED
    ? await resizeImageFromUrl(getNextImageUrlForManipulation(video.url))
    : '';

  const blurData = BLUR_ENABLED
    ? await blurImageFromUrl(getNextImageUrlForManipulation(video.url))
    : '';

  return (
    <VideoEditPageClient
      {...{
        video,
        uniqueTags,
        hasAiTextGeneration,
        imageThumbnailBase64,
        blurData,
      }}
    />
  );
}
