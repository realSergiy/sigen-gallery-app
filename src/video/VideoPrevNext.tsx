'use client';

import { useEffect } from 'react';
import {
  Video,
  VideoSetAttributes,
  getNextVideo,
  getPreviousVideo,
} from '@/video';
import VideoLink from './VideoLink';
import { useRouter } from 'next/navigation';
import { pathForVideo } from '@/site/paths';
import { useAppState } from '@/state/AppState';
import { AnimationConfig } from '@/components/AnimateItems';
import { clsx } from 'clsx/lite';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const LISTENER_KEYUP = 'keyup';

const ANIMATION_LEFT: AnimationConfig = { type: 'left', duration: 0.3 };
const ANIMATION_RIGHT: AnimationConfig = { type: 'right', duration: 0.3 };

export default function VideoPrevNext({
  video,
  videos = [],
  className,
  tag,
  camera,
  simulation,
  focal,
}: {
  video?: Video;
  videos?: Video[];
  className?: string;
} & VideoSetAttributes) {
  const router = useRouter();

  const { setNextVideoAnimation, shouldRespondToKeyboardCommands } =
    useAppState();

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
                  camera,
                  simulation,
                  focal,
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
                  camera,
                  simulation,
                  focal,
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
    camera,
    simulation,
    focal,
  ]);

  return (
    <div className={clsx('flex items-center', className)}>
      <div className="flex items-center gap-2 select-none">
        <VideoLink
          video={previousVideo}
          className="h-[1rem] select-none"
          nextVideoAnimation={ANIMATION_RIGHT}
          tag={tag}
          camera={camera}
          simulation={simulation}
          focal={focal}
          scroll={false}
          prefetch
        >
          <FiChevronLeft className="translate-y-[-1px] text-[1.1rem] sm:hidden" />
          <span className="hidden sm:inline-block">PREV</span>
        </VideoLink>
        <span className="text-extra-extra-dim">/</span>
        <VideoLink
          video={nextVideo}
          className="h-[1rem] select-none"
          nextVideoAnimation={ANIMATION_LEFT}
          tag={tag}
          camera={camera}
          simulation={simulation}
          focal={focal}
          scroll={false}
          prefetch
        >
          <FiChevronRight className="translate-y-[-1px] text-[1.1rem] sm:hidden" />
          <span className="hidden sm:inline-block">NEXT</span>
        </VideoLink>
      </div>
    </div>
  );
}
