'use client';

import { PATH_OG } from '@/site/paths';
import InfinitePhotoScroll from '../../photo/InfinitePhotoScroll';
import StaggeredOgImages from './StaggeredOgImages';

export default function StaggeredOgPhotosInfinite({
  initialOffset,
  itemsPerPage,
}: {
  initialOffset: number;
  itemsPerPage: number;
}) {
  return (
    <InfinitePhotoScroll
      cacheKey={`page-${PATH_OG}`}
      initialOffset={initialOffset}
      itemsPerPage={itemsPerPage}
    >
      {({ items: photos, onLastItemVisible: onLastPhotoVisible }) => (
        <StaggeredOgImages photos={photos} onLastPhotoVisible={onLastPhotoVisible} />
      )}
    </InfinitePhotoScroll>
  );
}
