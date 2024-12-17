'use client';

import { ReactNode } from 'react';
import { Video, VideoSetAttributes, titleForVideo } from '@/video';
import Link from 'next/link';
import { AnimationConfig } from '../components/AnimateItems';
import { useAppState } from '@/state/AppState';
import { pathForVideo } from '@/site/paths';
import { clsx } from 'clsx/lite';

export default function VideoLink({
  video,
  tag,
  camera,
  simulation,
  focal,
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
      href={pathForVideo({ video, tag, camera, simulation, focal })}
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
