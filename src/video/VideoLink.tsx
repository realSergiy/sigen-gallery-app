'use client';

import { ReactNode } from 'react';
import { VideoSetAttributes, titleForVideo } from '@/video';
import Link from 'next/link';
import { AnimationConfig } from '../components/AnimateItems';
import { useAppState } from '@/state/AppState';
import { pathForVideo } from '@/site/paths';
import { clsx } from 'clsx/lite';
import { Video } from '@/db/video_orm';

export default function VideoLink({
  video,
  tag,
  scroll,
  prefetch,
  nextVideoAnimation,
  className,
  children,
}: {
  video?: Video;
  scroll?: boolean;
  prefetch?: boolean;
  nextVideoAnimation?: AnimationConfig;
  className?: string;
  children?: ReactNode;
} & VideoSetAttributes) {
  const { setNextVideoAnimation } = useAppState();

  return video ? (
    <Link
      href={pathForVideo({ video, tag })}
      prefetch={prefetch}
      onClick={() => {
        if (nextVideoAnimation) {
          setNextVideoAnimation?.(nextVideoAnimation);
        }
      }}
      className={className}
      scroll={scroll}
    >
      {children ?? titleForVideo(video)}
    </Link>
  ) : (
    <span className={clsx('cursor-default text-gray-300 dark:text-gray-700', className)}>
      {children ?? (video ? titleForVideo(video) : undefined)}
    </span>
  );
}
