'use client';

import { INFINITE_SCROLL_GRID_MULTIPLE } from '.';
import InfiniteVideoScroll from './InfiniteVideoScroll';
import VideoGrid from './VideoGrid';
import { ComponentProps } from 'react';

export default function VideoGridInfinite({
  cacheKey,
  initialOffset,
  canStart,
  tag,
  animateOnFirstLoadOnly,
  canSelect,
}: {
  cacheKey: string;
  initialOffset: number;
} & Omit<ComponentProps<typeof VideoGrid>, 'videos'>) {
  return (
    <InfiniteVideoScroll
      cacheKey={cacheKey}
      initialOffset={initialOffset}
      itemsPerPage={INFINITE_SCROLL_GRID_MULTIPLE}
      tag={tag}
    >
      {({ items: videos, onLastItemVisible: onLastVideoVisible }) => (
        <VideoGrid
          {...{
            videos,
            canStart,
            tag,
            onLastVideoVisible,
            animateOnFirstLoadOnly,
            canSelect,
          }}
        />
      )}
    </InfiniteVideoScroll>
  );
}
