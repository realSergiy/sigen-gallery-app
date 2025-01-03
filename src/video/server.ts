import { getExtensionFromStorageUrl, getVideoIdFromStorageUrl } from '@/services/storage';
import { VideoFormData } from './form';

export const extractVideoDataFromBlobPath = async (
  blobPath: string,
  options?: {
    generateResizedImage?: boolean;
  },
): Promise<{
  blobId?: string;
  videoFormData?: Partial<VideoFormData>;
  imageThumbnailBase64?: string;
  shouldStripGpsData?: boolean;
  fileBytes?: ArrayBuffer;
}> => {
  const { generateResizedImage } = options ?? {};

  const url = decodeURIComponent(blobPath);

  const blobId = getVideoIdFromStorageUrl(url);

  const extension = getExtensionFromStorageUrl(url);

  const fileBytes = blobPath
    ? await fetch(url, { cache: 'no-store' }).then(res => res.arrayBuffer())
    : undefined;

  let imageThumbnailBase64: string | undefined;

  if (fileBytes) {
    if (generateResizedImage) {
      //      imageThumbnailBase64 = await resizeImage(fileBytes);
    }
  }

  return {
    blobId,
    videoFormData: {
      hidden: 'false',
      favorite: 'false',
      extension,
      url,
    },
    imageThumbnailBase64,
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
