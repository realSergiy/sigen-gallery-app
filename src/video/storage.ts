import {
  copyFile,
  generateRandomFileNameForVideo,
  getExtensionFromStorageUrl,
  moveFile,
} from '@/services/storage';

export const convertUploadToVideo = async ({
  urlOrigin,
  shouldDeleteOrigin = true,
}: {
  urlOrigin: string;
  fileBytes?: ArrayBuffer;
  shouldDeleteOrigin?: boolean;
}) => {
  const fileName = generateRandomFileNameForVideo();
  const fileExtension = getExtensionFromStorageUrl(urlOrigin);
  const videoPath = `${fileName}.${fileExtension || 'mp4'}`;

  return shouldDeleteOrigin ? moveFile(urlOrigin, videoPath) : copyFile(urlOrigin, videoPath);
};
