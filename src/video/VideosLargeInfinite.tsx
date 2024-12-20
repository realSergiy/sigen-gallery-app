'use client';

import { PATH_ROOT } from '@/site/paths';
import InfiniteVideoScroll from './InfiniteVideoScroll';
import VideosLarge from './VideosLarge';

export default function VideosLargeInfinite({
  initialOffset,
  itemsPerPage,
}: {
  initialOffset: number;
  itemsPerPage: number;
}) {
  return (
    <InfiniteVideoScroll
      cacheKey={`page-${PATH_ROOT}`}
      initialOffset={initialOffset}
      itemsPerPage={itemsPerPage}
      wrapMoreButtonInGrid
    >
      {({ videos, onLastVideoVisible, revalidateVideo }) => (
        <VideosLarge
          videos={videos}
          onLastVideoVisible={onLastVideoVisible}
          revalidateVideo={revalidateVideo}
        />
      )}
    </InfiniteVideoScroll>
  );
}
