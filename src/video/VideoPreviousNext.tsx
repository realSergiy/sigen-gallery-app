'use client';

import { useEffect } from 'react';
import { VideoSetAttributes, getNextVideo, getPreviousVideo } from '@/video';
import VideoLink from './VideoLink';
import { useRouter } from 'next/navigation';
import { pathForVideo } from '@/site/paths';
import { useAppState } from '@/state/AppState';
import { AnimationConfig } from '@/components/AnimateItems';
import { clsx } from 'clsx/lite';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Video } from '@/db/video_orm';

const LISTENER_KEYUP = 'keyup';

const ANIMATION_LEFT: AnimationConfig = { type: 'left', duration: 0.3 };
const ANIMATION_RIGHT: AnimationConfig = { type: 'right', duration: 0.3 };

export default function VideoPreviousNext({
  video,
  videos = [],
  className,
  tag,
}: {
  video?: Video;
  videos?: Video[];
  className?: string;
} & VideoSetAttributes) {
  const router = useRouter();

  const { setNextVideoAnimation, shouldRespondToKeyboardCommands } = useAppState();

  const previousVideo = video ? getPreviousVideo(video, videos) : undefined;
  const nextVideo = video ? getNextVideo(video, videos) : undefined;

  useEffect(() => {
    if (shouldRespondToKeyboardCommands) {
      const onKeyUp = (e: KeyboardEvent) => {
        switch (e.key.toUpperCase()) {
          case 'ARROWLEFT':
          case 'J':
            if (previousVideo) {
              setNextVideoAnimation?.(ANIMATION_RIGHT);
              router.push(
                pathForVideo({
                  video: previousVideo,
                  tag,
                }),
                { scroll: false },
              );
            }
            break;
          case 'ARROWRIGHT':
          case 'L':
            if (nextVideo) {
              setNextVideoAnimation?.(ANIMATION_LEFT);
              router.push(
                pathForVideo({
                  video: nextVideo,
                  tag,
                }),
                { scroll: false },
              );
            }
            break;
        }
      };
      window.addEventListener(LISTENER_KEYUP, onKeyUp);
      return () => window.removeEventListener(LISTENER_KEYUP, onKeyUp);
    }
  }, [
    router,
    shouldRespondToKeyboardCommands,
    setNextVideoAnimation,
    previousVideo,
    nextVideo,
    tag,
  ]);

  return (
    <div className={clsx('flex items-center', className)}>
      <div className="flex select-none items-center gap-2">
        <VideoLink
          video={previousVideo}
          className="h-4 select-none"
          nextVideoAnimation={ANIMATION_RIGHT}
          tag={tag}
          scroll={false}
          prefetch
        >
          <FiChevronLeft className="-translate-y-px text-[1.1rem] sm:hidden" />
          <span className="hidden sm:inline-block">PREV</span>
        </VideoLink>
        <span className="text-extra-extra-dim">/</span>
        <VideoLink
          video={nextVideo}
          className="h-4 select-none"
          nextVideoAnimation={ANIMATION_LEFT}
          tag={tag}
          scroll={false}
          prefetch
        >
          <FiChevronRight className="-translate-y-px text-[1.1rem] sm:hidden" />
          <span className="hidden sm:inline-block">NEXT</span>
        </VideoLink>
      </div>
    </div>
  );
}
