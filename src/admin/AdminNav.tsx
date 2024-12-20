import {
  getStoragePhotoUploadUrlsNoStore,
  getStorageVideoUploadUrlsNoStore,
} from '@/services/storage/cache';
import {
  getPhotosMetaCached,
  getPhotosMostRecentUpdateCached,
  getUniqueTagsCached,
} from '@/photo/cache';
import { getVideosMetaCached } from '@/db/video_cache';
import {
  PATH_ADMIN_PHOTOS,
  PATH_ADMIN_TAGS,
  PATH_ADMIN_PHOTO_UPLOADS,
  PATH_ADMIN_VIDEOS,
  PATH_ADMIN_VIDEO_UPLOADS,
} from '@/site/paths';
import AdminNavClient from './AdminNavClient';

export default async function AdminNav() {
  const [
    countPhotos,
    countVideos,
    countPhotoUploads,
    countVideoUploads,
    countTags,
    mostRecentPhotoUpdateTime,
  ] = await Promise.all([
    getPhotosMetaCached({ hidden: 'include' })
      .then(({ count }) => count)
      .catch(() => 0),
    getVideosMetaCached({ hidden: 'include' })
      .then(({ count }) => count)
      .catch(() => 0),
    getStoragePhotoUploadUrlsNoStore()
      .then(urls => urls.length)
      .catch(e => {
        console.error(`Error getting blob upload urls: ${e}`);
        return 0;
      }),
    getStorageVideoUploadUrlsNoStore()
      .then(urls => urls.length)
      .catch(e => {
        console.error(`Error getting blob upload urls: ${e}`);
        return 0;
      }),
    getUniqueTagsCached()
      .then(tags => tags.length)
      .catch(() => 0),
    getPhotosMostRecentUpdateCached().catch(() => undefined),
  ]);

  // Photos
  const items = [
    {
      label: 'Photos',
      href: PATH_ADMIN_PHOTOS,
      count: countPhotos,
    },
    {
      label: 'Videos',
      href: PATH_ADMIN_VIDEOS,
      count: countVideos,
    },
  ];

  // Video Uploads
  if (countVideoUploads > 0) {
    items.push({
      label: 'Video Uploads',
      href: PATH_ADMIN_VIDEO_UPLOADS,
      count: countVideoUploads,
    });
  }

  // Uploads
  if (countPhotoUploads > 0) {
    items.push({
      label: 'Photo Uploads',
      href: PATH_ADMIN_PHOTO_UPLOADS,
      count: countPhotoUploads,
    });
  }

  // Tags
  if (countTags > 0) {
    items.push({
      label: 'Tags',
      href: PATH_ADMIN_TAGS,
      count: countTags,
    });
  }

  return <AdminNavClient {...{ items, mostRecentPhotoUpdateTime }} />;
}
