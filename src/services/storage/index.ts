import {
  VERCEL_BLOB_BASE_URL,
  vercelBlobCopy,
  vercelBlobDelete,
  vercelBlobList,
  vercelBlobPut,
  vercelBlobUploadFromClient,
} from './vercel-blob';
import {
  AWS_S3_BASE_URL,
  awsS3Copy,
  awsS3Delete,
  awsS3List,
  awsS3Put,
  isUrlFromAwsS3,
} from './aws-s3';
import {
  CURRENT_STORAGE,
  HAS_AWS_S3_STORAGE,
  HAS_VERCEL_BLOB_STORAGE,
  HAS_CLOUDFLARE_R2_STORAGE,
} from '@/site/config';
import { generateNanoid } from '@/utility/nanoid';
import {
  CLOUDFLARE_R2_BASE_URL_PUBLIC,
  cloudflareR2Copy,
  cloudflareR2Delete,
  cloudflareR2List,
  cloudflareR2Put,
  isUrlFromCloudflareR2,
} from './cloudflare-r2';
import { PATH_API_PRESIGNED_URL } from '@/site/paths';

const logger = console;
const logOp = <T>(operationName: string, detail: string, promise: Promise<T>): Promise<T> => {
  logger.log(`[${operationName}] Starting: ${detail}`);
  return promise
    .then(result => {
      logger.log(`[${operationName}] Success: ${result}`);
      return result;
    })
    .catch(e => {
      logger.error(`[${operationName}] Error: ${detail}`, e);
      throw e;
    });
};

export const generateStorageId = () => generateNanoid(16);

export type StorageListResponse = {
  url: string;
  fileName: string;
  uploadedAt?: Date;
}[];

export type StorageType = 'vercel-blob' | 'aws-s3' | 'cloudflare-r2';

export const labelForStorage = (type: StorageType): string => {
  switch (type) {
    case 'vercel-blob':
      return 'Vercel Blob';
    case 'cloudflare-r2':
      return 'Cloudflare R2';
    case 'aws-s3':
      return 'AWS S3';
  }
};

export const baseUrlForStorage = (type: StorageType) => {
  switch (type) {
    case 'vercel-blob':
      return VERCEL_BLOB_BASE_URL;
    case 'cloudflare-r2':
      return CLOUDFLARE_R2_BASE_URL_PUBLIC;
    case 'aws-s3':
      return AWS_S3_BASE_URL;
  }
};

export const storageTypeFromUrl = (url: string): StorageType => {
  if (isUrlFromCloudflareR2(url)) {
    return 'cloudflare-r2';
  } else if (isUrlFromAwsS3(url)) {
    return 'aws-s3';
  } else {
    return 'vercel-blob';
  }
};

const PREFIX_PHOTO = 'photo';

export const generateRandomFileNameForPhoto = () => `${PREFIX_PHOTO}-${generateStorageId()}`;

export const generateRandomFileNameForVideo = () => `${PREFIX_VIDEO}-${generateStorageId()}`;

const PREFIX_PHOTO_UPLOAD = 'upload_p';

const REGEX_PHOTO_UPLOAD_PATH = new RegExp(`(?:${PREFIX_PHOTO_UPLOAD})\.[a-z]{1,4}`, 'i');

const REGEX_PHOTO_UPLOAD_ID = new RegExp(`.${PREFIX_PHOTO_UPLOAD}-([a-z0-9]+)\.[a-z]{1,4}$`, 'i');

const PREFIX_VIDEO_UPLOAD = 'upload_v';
const PREFIX_VIDEO = 'video';

const REGEX_VIDEO_UPLOAD_PATH = new RegExp(`(?:${PREFIX_VIDEO_UPLOAD})\.[a-z0-9]{1,4}`, 'i');

const REGEX_VIDEO_UPLOAD_ID = new RegExp(
  `.${PREFIX_VIDEO_UPLOAD}-([a-z0-9]+)\.[a-z0-9]{1,4}$`,
  'i',
);

export const fileNameForStorageUrl = (url: string) => {
  switch (storageTypeFromUrl(url)) {
    case 'vercel-blob':
      return url.replace(`${VERCEL_BLOB_BASE_URL}/`, '');
    case 'cloudflare-r2':
      return url.replace(`${CLOUDFLARE_R2_BASE_URL_PUBLIC}/`, '');
    case 'aws-s3':
      return url.replace(`${AWS_S3_BASE_URL}/`, '');
  }
};

export const getExtensionFromStorageUrl = (url: string) => /.([a-z0-9]{1,4})$/i.exec(url)?.[1];

export const getPhotoIdFromStorageUrl = (url: string) => REGEX_PHOTO_UPLOAD_ID.exec(url)?.[1];
export const getVideoIdFromStorageUrl = (url: string) => REGEX_VIDEO_UPLOAD_ID.exec(url)?.[1];

export const isPhotoUploadPathnameValid = (pathname?: string) =>
  pathname?.match(REGEX_PHOTO_UPLOAD_PATH);

export const isVideoUploadPathnameValid = (pathname?: string) =>
  pathname?.match(REGEX_VIDEO_UPLOAD_PATH);

const getFileNameFromStorageUrl = (url: string) => /\/(.+)$/.exec(new URL(url).pathname)?.[1] ?? '';
export const uploadFromClientViaPresignedUrl = async (
  file: File | Blob,
  fileName: string,
  extension: string,
  addRandomSuffix?: boolean,
) => {
  return logOp(
    'uploadFromClientViaPresignedUrl',
    `file "${fileName}" in ${CURRENT_STORAGE}`,
    (async () => {
      const key = addRandomSuffix
        ? `${fileName}-${generateStorageId()}.${extension}`
        : `${fileName}.${extension}`;

      const url = await fetch(`${PATH_API_PRESIGNED_URL}/${key}`).then(response => response.text());
      await fetch(url, { method: 'PUT', body: file });
      return `${baseUrlForStorage(CURRENT_STORAGE)}/${key}`;
    })(),
  );
};

export const uploadPhotoFromClient = async (file: File | Blob, extension = 'jpg') =>
  uploadBlobFromClient(PREFIX_PHOTO_UPLOAD, file, extension);

export const uploadVideoFromClient = async (file: File | Blob, extension = 'mp4') =>
  uploadBlobFromClient(PREFIX_VIDEO_UPLOAD, file, extension);

const uploadBlobFromClient = async (prefix: string, file: File | Blob, extension: string) =>
  logOp(
    'uploadBlobFromClient',
    `prefix: "${prefix}", file: ${'name' in file ? file.name : 'Blob'}, extension "${extension}" in ${CURRENT_STORAGE}`,
    (() =>
      CURRENT_STORAGE === 'cloudflare-r2' || CURRENT_STORAGE === 'aws-s3'
        ? uploadFromClientViaPresignedUrl(file, prefix, extension, true)
        : vercelBlobUploadFromClient(file, `${prefix}.${extension}`))(),
  );

export const putFile = (file: Buffer, fileName: string) =>
  logOp(
    'putFile',
    `file "${fileName}" in ${CURRENT_STORAGE}`,
    (() => {
      switch (CURRENT_STORAGE) {
        case 'vercel-blob':
          return vercelBlobPut(file, fileName);
        case 'cloudflare-r2':
          return cloudflareR2Put(file, fileName);
        case 'aws-s3':
          return awsS3Put(file, fileName);
      }
    })(),
  );

export const copyFile = (originUrl: string, destinationFileName: string): Promise<string> => {
  const currentStorage = storageTypeFromUrl(originUrl);
  return logOp(
    'copyFile',
    `from "${originUrl}" to "${destinationFileName}" in ${currentStorage}`,
    (() => {
      switch (currentStorage) {
        case 'vercel-blob':
          return vercelBlobCopy(originUrl, destinationFileName, false);
        case 'cloudflare-r2':
          return cloudflareR2Copy(getFileNameFromStorageUrl(originUrl), destinationFileName, false);
        case 'aws-s3':
          return awsS3Copy(originUrl, destinationFileName, false);
      }
    })(),
  );
};

export const deleteFile = (url: string) => {
  const currentStorage = storageTypeFromUrl(url);
  return logOp(
    'deleteFile',
    `file "${url}" in ${currentStorage}`,
    (() => {
      switch (currentStorage) {
        case 'vercel-blob':
          return vercelBlobDelete(url);
        case 'cloudflare-r2':
          return cloudflareR2Delete(getFileNameFromStorageUrl(url));
        case 'aws-s3':
          return awsS3Delete(getFileNameFromStorageUrl(url));
      }
    })(),
  );
};

export const moveFile = async (originUrl: string, destinationFileName: string) => {
  return logOp(
    'moveFile',
    `from "${originUrl}" to "${destinationFileName}"`,
    copyFile(originUrl, destinationFileName).then(async url => {
      if (url) {
        await deleteFile(originUrl);
      }
      return url;
    }),
  );
};

const getStorageUrlsForPrefix = async (prefix = '') => {
  const urls: StorageListResponse = [];

  if (HAS_VERCEL_BLOB_STORAGE) {
    urls.push(...(await vercelBlobList(prefix).catch(() => [])));
  }
  if (HAS_AWS_S3_STORAGE) {
    urls.push(...(await awsS3List(prefix).catch(() => [])));
  }
  if (HAS_CLOUDFLARE_R2_STORAGE) {
    urls.push(...(await cloudflareR2List(prefix).catch(() => [])));
  }

  return urls.sort((a, b) => {
    if (!a.uploadedAt) {
      return 1;
    }
    if (!b.uploadedAt) {
      return -1;
    }
    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });
};

export const getStoragePhotoUploadUrls = () => getStorageUrlsForPrefix(`${PREFIX_PHOTO_UPLOAD}-`);

export const getStorageVideoUploadUrls = () => getStorageUrlsForPrefix(`${PREFIX_VIDEO_UPLOAD}-`);

export const getStoragePhotoUrls = () => getStorageUrlsForPrefix(`${PREFIX_PHOTO}-`);

export const getStorageVideoUrls = () => getStorageUrlsForPrefix(`${PREFIX_VIDEO}-`);

export const testStorageConnection = () => getStorageUrlsForPrefix();
