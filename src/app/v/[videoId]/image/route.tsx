import { getVideoCached } from '@/video/cache';
import { IMAGE_OG_DIMENSION } from '@/image-response';
import { getIBMPlexMonoMedium } from '@/site/font';
import { ImageResponse } from 'next/og';
import { getImageResponseCacheControlHeaders } from '@/image-response/cache';
import { IS_PRODUCTION, STATICALLY_OPTIMIZED_OG_IMAGES } from '@/site/config';

import { isNextImageReadyBasedOnVideos } from '@/video';
import { getVideoIds } from '@/db/video_orm';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/media';
import VideoImageResponse from '@/image-response/VideoImageResponse';

export let generateStaticParams: (() => Promise<{ videoId: string }[]>) | undefined;

if (STATICALLY_OPTIMIZED_OG_IMAGES && IS_PRODUCTION) {
  generateStaticParams = async () => {
    const videos = await getVideoIds({ limit: GENERATE_STATIC_PARAMS_LIMIT });
    return videos.map(video => ({ videoId: video.id }));
  };
}

export async function GET(_: Request, context: { params: Promise<{ videoId: string }> }) {
  const [video, { fontFamily, fonts }, headers] = await Promise.all([
    getVideoCached((await context.params).videoId),
    getIBMPlexMonoMedium(),
    getImageResponseCacheControlHeaders(),
  ]);

  if (!video) {
    return new Response('Video not found', { status: 404 });
  }

  const { width, height } = IMAGE_OG_DIMENSION;

  // Make sure next/image can be reached from absolute urls,
  // which may not exist on first pre-render
  const isNextImageReady = await isNextImageReadyBasedOnVideos([video]);

  return new ImageResponse(
    (
      <VideoImageResponse
        {...{
          video,
          width,
          height,
          fontFamily,
          isNextImageReady,
        }}
      />
    ),
    { width, height, fonts, headers },
  );
}
