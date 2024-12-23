import { descriptionForVideo, RELATED_GRID_VIDEOS_TO_SHOW, titleForVideo } from '@/video';
import { Metadata } from 'next/types';
import { redirect } from 'next/navigation';
import { PATH_ROOT, absolutePathForVideo, absolutePathForVideoImage } from '@/site/paths';
import VideoDetailPage from '@/video/VideoDetailPage';
import { getVideosNearIdCached } from '@/video/cache';
import { IS_PRODUCTION, STATICALLY_OPTIMIZED_PAGES } from '@/site/config';

import { ReactNode, cache } from 'react';
import { GENERATE_STATIC_PARAMS_LIMIT } from '@/media';
import { getVideoIds } from '@/db/video_orm';

export const maxDuration = 60;

const getVideosNearIdCachedCached = cache((videoId: string) =>
  getVideosNearIdCached(videoId, { limit: RELATED_GRID_VIDEOS_TO_SHOW + 2 }),
);

export let generateStaticParams: (() => Promise<{ videoId: string }[]>) | undefined = undefined;

if (STATICALLY_OPTIMIZED_PAGES && IS_PRODUCTION) {
  generateStaticParams = async () => {
    const videos = await getVideoIds({ limit: GENERATE_STATIC_PARAMS_LIMIT });
    return videos.map(video => ({ videoId: video.id }));
  };
}

interface VideoProps {
  params: { videoId: string };
}

export async function generateMetadata({ params: { videoId } }: VideoProps): Promise<Metadata> {
  const { video } = await getVideosNearIdCachedCached(videoId);

  if (!video) {
    return {};
  }

  const title = titleForVideo(video);
  const description = descriptionForVideo(video);
  const images = absolutePathForVideoImage(video);
  const url = absolutePathForVideo({ video });

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

export default async function VideoPage({
  params: { videoId },
  children,
}: VideoProps & { children: ReactNode }) {
  const { video, videos, videosGrid } = await getVideosNearIdCachedCached(videoId);

  if (!video) {
    redirect(PATH_ROOT);
  }

  return (
    <>
      {children}
      <VideoDetailPage {...{ video, videos, videosGrid }} />
    </>
  );
}
