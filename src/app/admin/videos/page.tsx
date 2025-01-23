import { getStorageVideoUrlsNoStore } from '@/services/storage/cache';
import { getVideos } from '@/db/video_orm';
import { getVideosMetaCached } from '@/db/video_cache';
import AdminVideosClient from '@/admin/AdminVideosClient';

export const maxDuration = 60;

const DEBUG_PHOTO_BLOBS = false;

const INFINITE_SCROLL_INITIAL_ADMIN = 25;
const INFINITE_SCROLL_MULTIPLE_ADMIN = 50;

export default async function AdminVideosPage() {
  const [videos, videosCount, videosCountOutdated, blobVideoUrls] = await Promise.all([
    getVideos({
      limit: INFINITE_SCROLL_INITIAL_ADMIN,
    }).catch(e => {
      console.error('Failed to get videos', e);
      return [];
    }),
    getVideosMetaCached({ hidden: 'include' })
      .then(({ count }) => count)
      .catch(() => 0),
    getVideosMetaCached({
      hidden: 'include',
      filter: 'outdatedOnly',
    })
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
        blobVideoUrls,
        infiniteScrollInitial: INFINITE_SCROLL_INITIAL_ADMIN,
        infiniteScrollMultiple: INFINITE_SCROLL_MULTIPLE_ADMIN,
      }}
    />
  );
}
