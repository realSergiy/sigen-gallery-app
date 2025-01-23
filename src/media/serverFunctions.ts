'use server';

import { runAuthenticatedAdminServerAction } from '@/auth';
import { deleteFile, getStorageVideoUploadUrls } from '@/services/storage';
import { revalidateAdminPaths } from '@/video/cache';

export const deleteUploadAction = async (url: string, deleteRelatedVideoUrl = false) =>
  runAuthenticatedAdminServerAction(async () => {
    await deleteFile(url);
    if (deleteRelatedVideoUrl) {
      const videoUrl = await findRelatedVideoUrl(url);

      if (videoUrl) {
        await deleteFile(videoUrl);
      }
    }
    revalidateAdminPaths();
  });

export const findRelatedVideoUrl = async (videoUploadUrl: string) => {
  const videoUploadUrls = await getStorageVideoUploadUrls();
  const videoUrlPrefix = videoUploadUrl.slice(0, Math.max(0, videoUploadUrl.lastIndexOf('-')));
  const res = videoUploadUrls.find(({ url }) => url.startsWith(videoUrlPrefix));
  return res?.url;
};
