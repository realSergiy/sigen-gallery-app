import { unstable_noStore } from 'next/cache';
import {
  getStoragePhotoUrls,
  getStoragePhotoUploadUrls,
  getStorageVideoUrls,
  getStorageVideoUploadUrls,
} from '@/services/storage';

export const getStoragePhotoUploadUrlsNoStore: typeof getStoragePhotoUploadUrls =
  (...args) => {
    unstable_noStore();
    return getStoragePhotoUploadUrls(...args);
  };

export const getStorageVideoUploadUrlsNoStore: typeof getStorageVideoUploadUrls =
  (...args) => {
    unstable_noStore();
    return getStorageVideoUploadUrls(...args);
  };

export const getStoragePhotoUrlsNoStore: typeof getStoragePhotoUrls = (
  ...args
) => {
  unstable_noStore();
  return getStoragePhotoUrls(...args);
};

export const getStorageVideoUrlsNoStore: typeof getStorageVideoUrls = (
  ...args
) => {
  unstable_noStore();
  return getStorageVideoUrls(...args);
};

// ToDo: replace
// unstable_noStore();
// with Next.js 15's
// await connection();
// https://nextjs.org/docs/app/api-reference/functions/connection
