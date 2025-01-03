import { redirect } from 'next/navigation';
import { getVideoNoStore, getUniqueTagsCached } from '@/video/cache';
import { PATH_ADMIN } from '@/site/paths';
import VideoEditPageClient from '@/video/VideoEditPageClient';

export default async function VideoEditPage(props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;

  const { videoId } = params;

  const video = await getVideoNoStore(videoId, true);

  if (!video) {
    redirect(PATH_ADMIN);
  }

  const uniqueTags = await getUniqueTagsCached();

  /*
  // Only generate image thumbnails when AI generation is enabled
  const imageThumbnailBase64 = AI_TEXT_GENERATION_ENABLED
    ? await resizeImageFromUrl(getNextImageUrlForManipulation(video.url))
    : '';
    */

  /*
  const blurData = BLUR_ENABLED
    ? await blurImageFromUrl(getNextImageUrlForManipulation(video.url))
    : '';
*/

  return (
    <VideoEditPageClient
      {...{
        video,
        uniqueTags,
      }}
    />
  );
}
