import { unstable_noStore } from 'next/cache';
import { getStoragePhotoUrls, getStoragePhotoUploadUrls, getStorageVideoUrls, getStorageVideoUploadUrls } from '@/services/storage';

export const getStoragePhotoUploadUrlsNoStore: typeof getStoragePhotoUploadUrls = (
  ...args
) => {
  unstable_noStore();
  return getStoragePhotoUploadUrls(...args);
};

export const getStorageVideoUploadUrlsNoStore: typeof getStorageVideoUploadUrls = (
  ...args
) => {
  unstable_noStore();
  return getStorageVideoUploadUrls(...args);
};

export const getStoragePhotoUrlsNoStore: typeof getStoragePhotoUrls = (
  ...args
) => {
  unstable_noStore();
  return getStoragePhotoUrls(...args);
};
