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
import { generateThumbnailPng } from '../thumbnailGenerator';
import { stripExtension } from '@/utility/file';
import { createLogOp } from '@/utility/logging';
import { ACCEPTED_PHOTO_EXTENSIONS } from '@/photo';
import { ACCEPTED_VIDEO_EXTENSIONS, ACCEPTED_VIDEO_THUMBNAIL_EXTENSIONS } from '@/video';

const logger = console;
const logOp = createLogOp(logger);

export const generateStorageId = () => generateNanoid(16);

export type StorageResponse = {
  url: string;
  fileName: string;
  uploadedAt?: Date;
};

export type StorageListResponse = StorageResponse[];

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

const PREFIX_VIDEO_UPLOAD = 'upload_v';
const PREFIX_VIDEO = 'video';

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

export const getExtensionFromStorageUrl = (url: string) => url.match(/.([a-z0-9]{1,4})$/i)?.[1];

const REGEX_PHOTO_UPLOAD_ID = new RegExp(`.${PREFIX_PHOTO_UPLOAD}-([a-z0-9]+)\.[a-z]{1,4}$`, 'i');

const getPhotoIdFromStorageUrl = (url: string) => url.match(REGEX_PHOTO_UPLOAD_ID)?.[1];

const REGEX_VIDEO_UPLOAD_ID = new RegExp(
  `.${PREFIX_VIDEO_UPLOAD}-([a-z0-9]+)\.[a-z0-9]{1,4}$`,
  'i',
);

const getVideoIdFromStorageUrl = (url: string) => url.match(REGEX_VIDEO_UPLOAD_ID)?.[1];

export const getIdFromStorageUrl = (url: string, type: 'photo' | 'video' | 'thumbnail') => {
  switch (type) {
    case 'photo':
      return getPhotoIdFromStorageUrl(url);
    case 'video':
      return getVideoIdFromStorageUrl(url);
    case 'thumbnail':
      return getVideoIdFromStorageUrl(url);
  }
};

export const isPhotoUploadPathnameValid = (pathname?: string) => {
  const extensions = ACCEPTED_PHOTO_EXTENSIONS.join('|');
  const regex = new RegExp(`^${PREFIX_PHOTO_UPLOAD}\\.[^.]+\\.(${extensions})$`, 'i');
  return regex.test(pathname ?? '');
};

export const isThumbnailUploadPathnameValid = (pathname?: string) => {
  const extensions = ACCEPTED_VIDEO_THUMBNAIL_EXTENSIONS.join('|');
  const regex = new RegExp(`^${PREFIX_VIDEO_UPLOAD}\\.[^.]+\\.(${extensions})$`, 'i');
  return regex.test(pathname ?? '');
};

export const isVideoUploadPathnameValid = (pathname?: string) => {
  const extensions = ACCEPTED_VIDEO_EXTENSIONS.join('|');
  const regex = new RegExp(`^${PREFIX_VIDEO_UPLOAD}\\.[^.]+\\.(${extensions})$`, 'i');
  return regex.test(pathname ?? '');
};

const getFileNameFromStorageUrl = (url: string) =>
  new URL(url).pathname.match(/\/(.+)$/)?.[1] ?? '';

export const uploadFromClientViaPresignedUrl = logOp(
  async (file: File | Blob, fileName: string, extension: string, addRandomSuffix?: boolean) => ({
    name: 'uploadFromClientViaPresignedUrl',
    params: `file "${fileName}" in ${CURRENT_STORAGE}`,
    op: async () => {
      const key = addRandomSuffix
        ? `${fileName}-${generateStorageId()}.${extension}`
        : `${fileName}.${extension}`;

      const url = await fetch(`${PATH_API_PRESIGNED_URL}/${key}`).then(response => response.text());
      await fetch(url, { method: 'PUT', body: file });
      return `${baseUrlForStorage(CURRENT_STORAGE)}/${key}`;
    },
  }),
);

export const uploadPhotoFromClient = async (file: File | Blob, extension = 'jpg') =>
  uploadBlobFromClient(PREFIX_PHOTO_UPLOAD, file, extension);

export const uploadVideoAndThumbnailFromClient = async (file: File, extension = 'mp4') => {
  const thumbnailFile = await generateThumbnailPng(file);
  const thumbnailUrl = await uploadBlobFromClient(
    `${PREFIX_VIDEO_UPLOAD}.${stripExtension(thumbnailFile.name)}`,
    thumbnailFile,
    'png',
  );
  await uploadBlobFromClient(
    `${PREFIX_VIDEO_UPLOAD}.${stripExtension(file.name)}`,
    file,
    extension,
  );

  return thumbnailUrl;
};

const uploadBlobFromClient = logOp(
  async (fileName: string, file: File | Blob, extension: string) => ({
    name: 'uploadBlobFromClient',
    params: `fileName: "${fileName}", file: ${'name' in file ? file.name : 'Blob'}, extension "${extension}" in ${CURRENT_STORAGE}`,
    op: () =>
      CURRENT_STORAGE === 'cloudflare-r2' || CURRENT_STORAGE === 'aws-s3'
        ? uploadFromClientViaPresignedUrl(file, fileName, extension, true)
        : vercelBlobUploadFromClient(file, `${fileName}.${extension}`),
  }),
);

export const putFile = logOp(async (file: Buffer, fileName: string) => ({
  name: 'putFile',
  params: `file "${fileName}" in ${CURRENT_STORAGE}`,
  op: async () => {
    switch (CURRENT_STORAGE) {
      case 'vercel-blob':
        return vercelBlobPut(file, fileName);
      case 'cloudflare-r2':
        return cloudflareR2Put(file, fileName);
      case 'aws-s3':
        return awsS3Put(file, fileName);
    }
  },
}));

export const copyFile = logOp(async (originUrl: string, destinationFileName: string) => ({
  name: 'copyFile',
  params: `from "${originUrl}" to "${destinationFileName}" in ${storageTypeFromUrl(originUrl)}`,
  op: async () => {
    switch (storageTypeFromUrl(originUrl)) {
      case 'vercel-blob':
        return vercelBlobCopy(originUrl, destinationFileName, false);
      case 'cloudflare-r2':
        return cloudflareR2Copy(getFileNameFromStorageUrl(originUrl), destinationFileName, false);
      case 'aws-s3':
        return awsS3Copy(originUrl, destinationFileName, false);
    }
  },
}));

export const deleteFile = logOp(async (url: string) => ({
  name: 'deleteFile',
  params: `file "${url}" in ${storageTypeFromUrl(url)}`,
  op: async () => {
    switch (storageTypeFromUrl(url)) {
      case 'vercel-blob':
        return vercelBlobDelete(url);
      case 'cloudflare-r2':
        return cloudflareR2Delete(getFileNameFromStorageUrl(url));
      case 'aws-s3':
        return awsS3Delete(getFileNameFromStorageUrl(url));
    }
  },
}));

export const moveFile = logOp(async (originUrl: string, destinationFileName: string) => ({
  name: 'moveFile',
  params: `from "${originUrl}" to "${destinationFileName}"`,
  op: async () => {
    const url = await copyFile(originUrl, destinationFileName);
    if (url) {
      await deleteFile(originUrl);
    }
    return url;
  },
}));

const getStorageUrlsForPrefixCore = async (prefix = '') => {
  const urls: StorageResponse[] = [];

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

const getStorageUrls = logOp(async (prefix?: string, extensions: string[] = []) => ({
  name: 'getStorageUrls',
  op: async () => {
    const allURLs = await getStorageUrlsForPrefixCore(prefix);
    const extensionsMatching =
      extensions.length > 0
        ? allURLs.filter(({ fileName }) =>
            extensions.some(extension => fileName.endsWith(`.${extension}`)),
          )
        : allURLs;
    return extensionsMatching;
  },
}));

export const getStoragePhotoUploadUrls = logOp(async () => ({
  name: 'getStoragePhotoUploadUrls',
  op: async () => await getStorageUrls(`${PREFIX_PHOTO_UPLOAD}`),
}));

export const getStorageVideoUploadUrls = async () =>
  getStorageUrls(`${PREFIX_VIDEO_UPLOAD}`, ['mp4']);

export const getStorageVideoUrls = async () => getStorageUrls(`${PREFIX_VIDEO}`, ['mp4']);
export const getStorageThumbnailUploadUrls = async () =>
  getStorageUrls(`${PREFIX_VIDEO_UPLOAD}`, ['png']);

export const getStorageThumbnailUrls = async () => getStorageUrls(`${PREFIX_VIDEO}`, ['png']);

export const getStoragePhotoUrls = () => getStorageUrls(`${PREFIX_PHOTO}`);

export const testStorageConnection = () => getStorageUrls();
