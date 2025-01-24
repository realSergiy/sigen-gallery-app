'use client';

import { PATH_OG } from '@/site/paths';
import InfiniteVideoScroll from './InfiniteVideoScroll';
import StaggeredOgVideos from './StaggeredOgVideos';

export default function StaggeredOgVideosInfinite({
  initialOffset,
  itemsPerPage,
}: {
  initialOffset: number;
  itemsPerPage: number;
}) {
  return (
    <InfiniteVideoScroll
      cacheKey={`page-${PATH_OG}`}
      initialOffset={initialOffset}
      itemsPerPage={itemsPerPage}
    >
      {({ items: videos, onLastItemVisible: onLastVideoVisible }) => (
        <StaggeredOgVideos videos={videos} onLastVideoVisible={onLastVideoVisible} />
      )}
    </InfiniteVideoScroll>
  );
}
