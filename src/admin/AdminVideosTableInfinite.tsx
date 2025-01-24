'use client';

import { PATH_ADMIN_PHOTOS } from '@/site/paths';
import InfiniteVideoScroll from '../video/InfiniteVideoScroll';
import AdminVideosTable from './AdminVideosTable';
import { ComponentProps } from 'react';

export default function AdminVideosTableInfinite({
  initialOffset,
  itemsPerPage,
  hasAiTextGeneration,
  canEdit,
  canDelete,
}: {
  initialOffset: number;
  itemsPerPage: number;
} & Omit<ComponentProps<typeof AdminVideosTable>, 'videos'>) {
  return (
    <InfiniteVideoScroll
      cacheKey={`page-${PATH_ADMIN_PHOTOS}`}
      initialOffset={initialOffset}
      itemsPerPage={itemsPerPage}
      useCached={false}
      sort={'createdAt'}
      includeHidden
    >
      {({
        items: videos,
        onLastItemVisible: onLastVideoVisible,
        revalidateItem: revalidateVideo,
      }) => (
        <AdminVideosTable
          videos={videos}
          onLastVideoVisible={onLastVideoVisible}
          revalidateVideo={revalidateVideo}
          hasAiTextGeneration={hasAiTextGeneration}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </InfiniteVideoScroll>
  );
}
