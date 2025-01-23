import { findRelatedVideoUrl } from '@/media/serverFunctions';
import { getExtensionFromStorageUrl, getIdFromStorageUrl } from '@/services/storage';

export const extractVideoMetaFromBlobPath = async (blobPath: string) => {
  const url = decodeURIComponent(blobPath);
  const videoUrl = await findRelatedVideoUrl(url);
  const blobId = getIdFromStorageUrl(url, 'video');
  const extension = getExtensionFromStorageUrl(videoUrl ?? '');

  return {
    blobId,
    videoFormData: {
      videoUrl,
      hidden: 'false',
      favorite: 'false',
      extension,
      url,
    },
  };
};

export const extractVideoDataFromBlobPath = async (blobPath: string) => {
  const { videoFormData } = await extractVideoMetaFromBlobPath(blobPath);

  const fileBytes = blobPath
    ? await fetch(videoFormData.url, { cache: 'no-store' }).then(res => res.arrayBuffer())
    : undefined;

  // find thumbnail
  const thumbnailBytes = null;

  return {
    thumbnailBytes,
    fileBytes,
  };
};

/*
const generateBase64 = async (image: ArrayBuffer, middleware: (sharp: Sharp) => Sharp) =>
  middleware(sharp(image))
    .withMetadata()
    .toFormat('jpeg', { quality: 90 })
    .toBuffer()
    .then(data => `data:image/jpeg;base64,${data.toString('base64')}`);

const resizeImage = async (image: ArrayBuffer) =>
  generateBase64(image, sharp => sharp.resize(IMAGE_WIDTH_RESIZE));

export const resizeImageFromUrl = async (url: string) =>
  fetch(decodeURIComponent(url))
    .then(res => res.arrayBuffer())
    .then(buffer => resizeImage(buffer))
    .catch(e => {
      console.log(`Error resizing image from URL (${url})`, e);
      return '';
    });
    */
