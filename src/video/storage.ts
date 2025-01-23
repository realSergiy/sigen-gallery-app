import {
  copyFile,
  generateRandomFileNameForVideo,
  getExtensionFromStorageUrl,
  moveFile,
} from '@/services/storage';

type Args = {
  urlOrigin: string;
  videoUrlOrigin: string;
  fileBytes?: ArrayBuffer;
  shouldDeleteOrigin?: boolean;
};

export const convertUploadToVideo = async ({
  urlOrigin,
  videoUrlOrigin,
  shouldDeleteOrigin = true,
}: Args) => {
  const fileName = generateRandomFileNameForVideo();

  const thumbnailFileExtension = getExtensionFromStorageUrl(urlOrigin);
  const thumbnailPath = `${fileName}.${thumbnailFileExtension || 'png'}`;

  const videoFileExtension = getExtensionFromStorageUrl(videoUrlOrigin);
  const videoPath = `${fileName}.${videoFileExtension || 'mp4'}`;

  const convert = shouldDeleteOrigin ? moveFile : copyFile;

  const url = await convert(urlOrigin, thumbnailPath);
  const videoUrl = await convert(videoUrlOrigin, videoPath);

  return { url, videoUrl };
};
