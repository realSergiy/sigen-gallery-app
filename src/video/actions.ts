'use server';

import { VideoFormData, convertFormDataToVideoDbInsert, convertVideoToFormData } from './form';
import { redirect } from 'next/navigation';
import { deleteFile } from '@/services/storage';
import {
  getVideosCached,
  getVideosMetaCached,
  revalidateAdminPaths,
  revalidateAllKeysAndPaths,
  revalidateVideo,
  revalidateVideosKey,
  revalidateTagsKey,
} from '@/video/cache';
import { PATH_ADMIN_VIDEOS, PATH_ADMIN_TAGS, PATH_ROOT, pathForVideo } from '@/site/paths';
import { extractVideoDataFromBlobPath } from './server';
import { TAG_FAVS, isTagFavs } from '@/tag';
import { convertVideoToVideoDbUpdate } from '.';
import { runAuthenticatedAdminServerAction } from '@/auth';

import { convertUploadToVideo } from './storage';
import { convertStringToArray } from '@/utility/string';
import {
  addTagsToVideos,
  deleteVideo,
  deleteVideoTagGlobally,
  getVideo,
  getVideos,
  insertVideo,
  renameVideoTagGlobally,
  updateVideo,
  VideoQueryOptions,
} from '@/db/video_orm';
import { GENERATE_RESIZED_IMAGE } from '@/site/config';

// Private actions

export const createVideoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const shouldStripGpsData = formData.get('shouldStripGpsData') === 'true';
    formData.delete('shouldStripGpsData');

    const video = convertFormDataToVideoDbInsert(formData);

    const updatedUrl = await convertUploadToVideo({
      urlOrigin: video.url,
    });

    if (updatedUrl) {
      video.url = updatedUrl;
      await insertVideo(video);
      revalidateAllKeysAndPaths();
      redirect(PATH_ADMIN_VIDEOS);
    }
  });

export const updateVideoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = convertFormDataToVideoDbInsert(formData);

    let urlToDelete: string | undefined;
    if (video.hidden && video.url.includes(video.id)) {
      // Backfill:
      // Anonymize storage url on update if necessary by
      // re-running image upload transfer logic
      const url = await convertUploadToVideo({
        urlOrigin: video.url,
        shouldDeleteOrigin: false,
      });
      if (url) {
        urlToDelete = video.url;
        video.url = url;
      }
    }

    await updateVideo(video).then(async () => {
      if (urlToDelete) {
        await deleteFile(urlToDelete);
      }
    });

    revalidateVideo(video.id);

    redirect(PATH_ADMIN_VIDEOS);
  });

export const tagMultipleVideosAction = (tags: string, videoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    await addTagsToVideos(convertStringToArray(tags, false) ?? [], videoIds);
    revalidateAllKeysAndPaths();
  });

export const toggleFavoriteVideoAction = async (videoId: string, shouldRedirect?: boolean) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId);
    if (video) {
      const { tags } = video;
      video.tags = tags.some(tag => tag === TAG_FAVS)
        ? tags.filter(tag => !isTagFavs(tag))
        : [...tags, TAG_FAVS];
      await updateVideo(convertVideoToVideoDbUpdate(video));
      revalidateAllKeysAndPaths();
      if (shouldRedirect) {
        redirect(pathForVideo({ video: videoId }));
      }
    }
  });

export const deleteVideosAction = async (videoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    for (const videoId of videoIds) {
      const video = await getVideo(videoId, true);
      if (video) {
        await deleteVideo(videoId).then(() => deleteFile(video.url));
      }
    }
    revalidateAllKeysAndPaths();
  });

export const deleteVideoAction = async (
  videoId: string,
  videoUrl: string,
  shouldRedirect?: boolean,
) =>
  runAuthenticatedAdminServerAction(async () => {
    await deleteVideo(videoId).then(() => deleteFile(videoUrl));
    revalidateAllKeysAndPaths();
    if (shouldRedirect) {
      redirect(PATH_ROOT);
    }
  });

export const deleteVideoTagGloballyAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const tag = formData.get('tag') as string;

    await deleteVideoTagGlobally(tag);

    revalidateVideosKey();
    revalidateAdminPaths();
  });

export const renameVideoTagGloballyAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const tag = formData.get('tag') as string;
    const updatedTag = formData.get('updatedTag') as string;

    if (tag && updatedTag && tag !== updatedTag) {
      await renameVideoTagGlobally(tag, updatedTag);
      revalidateVideosKey();
      revalidateTagsKey();
      redirect(PATH_ADMIN_TAGS);
    }
  });

export const deleteUploadAction = async (url: string) =>
  runAuthenticatedAdminServerAction(async () => {
    await deleteFile(url);
    revalidateAdminPaths();
  });

// Accessed from admin video table, will:
// - update EXIF data
// - anonymize storage url if necessary
// - strip GPS data if necessary
// - update blur data (or destroy if blur is disabled)
// - generate AI text data, if enabled, and auto-generated fields are empty
export const syncVideoAction = async (videoId: string) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId, true);

    if (video) {
      const { fileBytes } = await extractVideoDataFromBlobPath(video.url, {
        generateResizedImage: GENERATE_RESIZED_IMAGE,
      });

      let urlToDelete: string | undefined;

      if (video.url.includes(video.id)) {
        // Anonymize storage url on update if necessary by
        // re-running image upload transfer logic
        const url = await convertUploadToVideo({
          urlOrigin: video.url,
          fileBytes,
          shouldDeleteOrigin: false,
        });
        if (url) {
          urlToDelete = video.url;
          video.url = url;
        }
      }

      const videoFormDbInsert = convertFormDataToVideoDbInsert({
        ...convertVideoToFormData(video),
      });

      await updateVideo(videoFormDbInsert).then(async () => {
        if (urlToDelete) {
          await deleteFile(urlToDelete);
        }
      });

      revalidateAllKeysAndPaths();
    }
  });

export const syncVideosAction = async (videoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    for (const videoId of videoIds) {
      await syncVideoAction(videoId);
    }
    revalidateAllKeysAndPaths();
  });

export const clearCacheAction = async () =>
  runAuthenticatedAdminServerAction(revalidateAllKeysAndPaths);

/*
export const getImageBlurAction = async (url: string) =>
  runAuthenticatedAdminServerAction(() => blurImageFromUrl(url));
*/

export const getVideosHiddenMetaCachedAction = async () =>
  runAuthenticatedAdminServerAction(() => getVideosMetaCached({ hidden: 'only' }));

// Public/Private actions

export const getVideosAction = async (options: VideoQueryOptions) =>
  areOptionsSensitive(options)
    ? runAuthenticatedAdminServerAction(() => getVideos(options))
    : getVideos(options);

export const getVideosCachedAction = async (options: VideoQueryOptions) =>
  areOptionsSensitive(options)
    ? runAuthenticatedAdminServerAction(() => getVideosCached(options))
    : getVideosCached(options);

const areOptionsSensitive = (options: VideoQueryOptions) => {
  const { hidden } = options;
  return hidden === 'include' || hidden === 'only';
};

// Public actions

// for kcmd functionality

// export const searchVideosAction = async (query: string) =>
//   getVideos({ query, limit: 10 }).catch(e => {
//     console.error('Could not query videos', e);
//     return [] as Video[];
//   });
