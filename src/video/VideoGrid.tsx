'use client';

import VideoMedium from './VideoMedium';
import { clsx } from 'clsx/lite';
import AnimateItems from '@/components/AnimateItems';
import { GRID_ASPECT_RATIO } from '@/site/config';
import { useAppState } from '@/state/AppState';
import SelectTileOverlay from '@/components/SelectTileOverlay';
import { Video } from '@/db/video_orm';
import { VideoSetAttributes } from '.';

export default function VideoGrid({
  videos,
  selectedVideo,
  tag,
  videoPriority,
  fast,
  animate = true,
  canStart,
  animateOnFirstLoadOnly,
  staggerOnFirstLoadOnly = true,
  additionalTile,
  small,
  canSelect,
  onLastVideoVisible,
  onAnimationComplete,
}: {
  videos: Video[];
  selectedVideo?: Video;
  videoPriority?: boolean;
  fast?: boolean;
  animate?: boolean;
  canStart?: boolean;
  animateOnFirstLoadOnly?: boolean;
  staggerOnFirstLoadOnly?: boolean;
  additionalTile?: JSX.Element;
  small?: boolean;
  canSelect?: boolean;
  onLastVideoVisible?: () => void;
  onAnimationComplete?: () => void;
} & VideoSetAttributes) {
  const { isUserSignedIn, selectedVideoIds, setSelectedVideoIds, isGridHighDensity } =
    useAppState();

  return (
    <AnimateItems
      className={clsx(
        'grid gap-0.5 sm:gap-1',
        small
          ? 'grid-cols-3 xs:grid-cols-6'
          : isGridHighDensity
            ? 'grid-cols-2 xs:grid-cols-4 lg:grid-cols-6'
            : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4',
        'items-center',
      )}
      type={animate === false ? 'none' : undefined}
      canStart={canStart}
      duration={fast ? 0.3 : undefined}
      staggerDelay={0.075}
      distanceOffset={40}
      animateOnFirstLoadOnly={animateOnFirstLoadOnly}
      staggerOnFirstLoadOnly={staggerOnFirstLoadOnly}
      onAnimationComplete={onAnimationComplete}
      items={videos
        .map((video, index) => {
          const isSelected = selectedVideoIds?.includes(video.id) ?? false;
          return (
            <div
              key={video.id}
              className={clsx(GRID_ASPECT_RATIO !== 0 && 'relative flex overflow-hidden', 'group')}
              style={{
                ...(GRID_ASPECT_RATIO !== 0 && {
                  aspectRatio: GRID_ASPECT_RATIO,
                }),
              }}
            >
              <VideoMedium
                className={clsx(
                  'flex h-full w-full',
                  // Prevent video navigation when selecting
                  selectedVideoIds?.length !== undefined && 'pointer-events-none',
                )}
                {...{
                  video,
                  tag,
                  selected: video.id === selectedVideo?.id,
                  priority: videoPriority,
                  onVisible: index === videos.length - 1 ? onLastVideoVisible : undefined,
                }}
              />
              {isUserSignedIn && canSelect && selectedVideoIds !== undefined && (
                <SelectTileOverlay
                  isSelected={isSelected}
                  onSelectChange={() =>
                    setSelectedVideoIds?.(
                      isSelected
                        ? (selectedVideoIds ?? []).filter(id => id !== video.id)
                        : (selectedVideoIds ?? []).concat(video.id),
                    )
                  }
                />
              )}
            </div>
          );
        })
        .concat(additionalTile ?? [])}
      itemKeys={videos.map(video => video.id).concat(additionalTile ? ['more'] : [])}
    />
  );
}
