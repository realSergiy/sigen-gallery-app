import { getExtensionFromStorageUrl, getVideoIdFromStorageUrl } from '@/services/storage';
import sharp, { Sharp } from 'sharp';
import { PRO_MODE_ENABLED } from '@/site/config';
import { VideoFormData } from './form';
import { convertExifToFormData } from '@/photo/form';

const IMAGE_WIDTH_RESIZE = 200;
const IMAGE_WIDTH_BLUR = 200;

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
      imageThumbnailBase64 = await resizeImage(fileBytes);
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

const generateBase64 = async (image: ArrayBuffer, middleware: (sharp: Sharp) => Sharp) =>
  middleware(sharp(image))
    .withMetadata()
    .toFormat('jpeg', { quality: 90 })
    .toBuffer()
    .then(data => `data:image/jpeg;base64,${data.toString('base64')}`);

const resizeImage = async (image: ArrayBuffer) =>
  generateBase64(image, sharp => sharp.resize(IMAGE_WIDTH_RESIZE));

const blurImage = async (image: ArrayBuffer) =>
  generateBase64(image, sharp =>
    sharp.resize(IMAGE_WIDTH_BLUR).modulate({ saturation: 1.15 }).blur(4),
  );

export const resizeImageFromUrl = async (url: string) =>
  fetch(decodeURIComponent(url))
    .then(res => res.arrayBuffer())
    .then(buffer => resizeImage(buffer))
    .catch(e => {
      console.log(`Error resizing image from URL (${url})`, e);
      return '';
    });

export const blurImageFromUrl = async (url: string) =>
  fetch(decodeURIComponent(url))
    .then(res => res.arrayBuffer())
    .then(buffer => blurImage(buffer))
    .catch(e => {
      console.log(`Error blurring image from URL (${url})`, e);
      return '';
    });

const GPS_NULL_STRING = '-';

export const removeGpsData = async (image: ArrayBuffer) =>
  sharp(image)
    .withExifMerge({
      IFD3: {
        GPSMapDatum: GPS_NULL_STRING,
        GPSLatitude: GPS_NULL_STRING,
        GPSLongitude: GPS_NULL_STRING,
        GPSDateStamp: GPS_NULL_STRING,
        GPSDateTime: GPS_NULL_STRING,
        GPSTimeStamp: GPS_NULL_STRING,
        GPSAltitude: GPS_NULL_STRING,
        GPSSatellites: GPS_NULL_STRING,
        GPSAreaInformation: GPS_NULL_STRING,
        GPSSpeed: GPS_NULL_STRING,
        GPSImgDirection: GPS_NULL_STRING,
        GPSDestLatitude: GPS_NULL_STRING,
        GPSDestLongitude: GPS_NULL_STRING,
        GPSDestBearing: GPS_NULL_STRING,
        GPSDestDistance: GPS_NULL_STRING,
        GPSHPositioningError: GPS_NULL_STRING,
      },
    })
    .toFormat('jpeg', { quality: PRO_MODE_ENABLED ? 95 : 80 })
    .toBuffer();
