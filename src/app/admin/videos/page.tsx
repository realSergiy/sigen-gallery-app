import { getStorageVideoUrlsNoStore } from '@/services/storage/cache';
import { getVideos } from '@/db/video_orm';
import { OUTDATED_THRESHOLD } from '@/photo';

import { revalidatePath } from 'next/cache';
import { desc, lt } from 'drizzle-orm';
import { getVideosMetaCached } from '@/db/video_cache';
import { videosTable } from '@/db/schema';
import AdminVideosClient from '@/admin/AdminVideosClient';

export const maxDuration = 60;

const DEBUG_PHOTO_BLOBS = false;

const INFINITE_SCROLL_INITIAL_ADMIN = 25;
const INFINITE_SCROLL_MULTIPLE_ADMIN = 50;

export default async function AdminPhotosPage() {
  const [videos, videosCount, videosCountOutdated, blobVideoUrls] =
    await Promise.all([
      getVideos({
        sort: desc(videosTable.createdAt),
        limit: INFINITE_SCROLL_INITIAL_ADMIN,
      }).catch(() => []),
      getVideosMetaCached()
        .then(({ count }) => count)
        .catch(() => 0),
      getVideosMetaCached(
        lt(videosTable.updatedAt, OUTDATED_THRESHOLD.toISOString()),
      )
        .then(({ count }) => count)
        .catch(() => 0),
      DEBUG_PHOTO_BLOBS ? getStorageVideoUrlsNoStore() : [],
    ]);

  return (
    <AdminVideosClient
      {...{
        videos,
        videosCount,
        videosCountOutdated,
        onLastVideoUpload: async () => {
          'use server';
          // Update upload count in admin nav
          revalidatePath('/admin', 'layout');
        },
        blobVideoUrls,
        infiniteScrollInitial: INFINITE_SCROLL_INITIAL_ADMIN,
        infiniteScrollMultiple: INFINITE_SCROLL_MULTIPLE_ADMIN,
      }}
    />
  );
}
