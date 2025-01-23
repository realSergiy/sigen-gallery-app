import { unstable_noStore } from 'next/cache';
import {
  getStoragePhotoUrls,
  getStoragePhotoUploadUrls,
  getStorageThumbnailUrls,
  getStorageThumbnailUploadUrls,
} from '@/services/storage';

export const getStoragePhotoUploadUrlsNoStore: typeof getStoragePhotoUploadUrls = (...args) => {
  unstable_noStore();
  return getStoragePhotoUploadUrls(...args);
};

export const getStorageVideoUploadUrlsNoStore: typeof getStorageThumbnailUploadUrls = (...args) => {
  unstable_noStore();
  return getStorageThumbnailUploadUrls(...args);
};

export const getStoragePhotoUrlsNoStore: typeof getStoragePhotoUrls = (...args) => {
  unstable_noStore();
  return getStoragePhotoUrls(...args);
};

export const getStorageVideoUrlsNoStore: typeof getStorageThumbnailUrls = (...args) => {
  unstable_noStore();
  return getStorageThumbnailUrls(...args);
};

// ToDo: replace
// unstable_noStore();
// with Next.js 15's
// await connection();
// https://nextjs.org/docs/app/api-reference/functions/connection
