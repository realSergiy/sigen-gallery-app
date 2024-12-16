import {
  copyFile,
  deleteFile,
  generateRandomFileNameForVideo,
  getExtensionFromStorageUrl,
  moveFile,
  putFile,
} from '@/services/storage';
import { removeGpsData } from './server';

export const convertUploadToVideo = async ({
  urlOrigin,
  fileBytes,
  shouldStripGpsData,
  shouldDeleteOrigin = true,
}: {
  urlOrigin: string;
  fileBytes?: ArrayBuffer;
  shouldStripGpsData?: boolean;
  shouldDeleteOrigin?: boolean;
}) => {
  const fileName = generateRandomFileNameForVideo();
  const fileExtension = getExtensionFromStorageUrl(urlOrigin);
  const videoPath = `${fileName}.${fileExtension || 'jpg'}`;
  if (shouldStripGpsData) {
    const fileWithoutGps = await removeGpsData(
      fileBytes ??
        (await fetch(urlOrigin, { cache: 'no-store' }).then(res =>
          res.arrayBuffer(),
        )),
    );
    return putFile(fileWithoutGps, videoPath).then(async url => {
      if (url && shouldDeleteOrigin) {
        await deleteFile(urlOrigin);
      }
      return url;
    });
  } else {
    return shouldDeleteOrigin
      ? moveFile(urlOrigin, videoPath)
      : copyFile(urlOrigin, videoPath);
  }
};
