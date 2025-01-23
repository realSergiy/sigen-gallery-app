'use server';

import { convertFormDataToVideoDbInsert, convertVideoToFormData } from './form';
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
  getVideosWithMasks,
  insertVideo,
  renameVideoTagGlobally,
  updateVideo,
  type VideoQueryOptions,
} from '@/db/video_orm';

// Private actions

export const createVideoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    formData.delete('shouldStripGpsData');

    const video = convertFormDataToVideoDbInsert(formData);

    const { url, videoUrl } = await convertUploadToVideo({
      urlOrigin: video.url,
      videoUrlOrigin: video.videoUrl,
    });

    if (url && videoUrl) {
      video.url = url;
      video.videoUrl = videoUrl;
      await insertVideo(video);
      revalidateAllKeysAndPaths();
      redirect(PATH_ADMIN_VIDEOS);
    }
  });

export const updateVideoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = convertFormDataToVideoDbInsert(formData);

    let urlToDelete: string | undefined;
    let videoUrlToDelete: string | undefined;

    if (video.hidden && video.url.includes(video.id)) {
      // Backfill:
      // Anonymize storage url on update if necessary by
      // re-running image upload transfer logic
      const { url, videoUrl } = await convertUploadToVideo({
        urlOrigin: video.url,
        videoUrlOrigin: video.videoUrl,
        shouldDeleteOrigin: false,
      });

      if (url && videoUrl) {
        urlToDelete = video.url;
        video.url = url;
        video.videoUrl = videoUrl;
      }
    }

    await updateVideo(video).then(async () => {
      if (urlToDelete) {
        await deleteFile(urlToDelete);
      }

      if (videoUrlToDelete) {
        await deleteFile(videoUrlToDelete);
      }
    });

    revalidateVideo(video.id);
    redirect(PATH_ADMIN_VIDEOS);
  });

export const tagMultipleVideosAction = async (tags: string, videoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    await addTagsToVideos(convertStringToArray(tags, false) ?? [], videoIds);
    revalidateAllKeysAndPaths();
  });

export const toggleFavoriteVideoAction = async (videoId: string, shouldRedirect?: boolean) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId);
    if (video) {
      const { tags } = video;
      video.tags = tags.includes(TAG_FAVS)
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
        await deleteVideoAndThumbnail(video);
      }
    }
    revalidateAllKeysAndPaths();
  });

export const deleteVideoAction = async (
  { id, url, videoUrl }: { id: string; url: string; videoUrl: string },
  shouldRedirect?: boolean,
) =>
  runAuthenticatedAdminServerAction(async () => {
    deleteVideoAndThumbnail({ id, url, videoUrl });

    revalidateAllKeysAndPaths();
    if (shouldRedirect) {
      redirect(PATH_ROOT);
    }
  });

const deleteVideoAndThumbnail = async ({
  id,
  url,
  videoUrl,
}: {
  id: string;
  url: string;
  videoUrl: string;
}) => {
  await deleteVideo(id);
  await deleteFile(url);
  await deleteFile(videoUrl);
};

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

// Accessed from admin video table, will:
// - update blur data (or destroy if blur is disabled)
// - generate AI text data, if enabled, and auto-generated fields are empty
export const syncVideoAction = async (videoId: string) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId, true);

    if (video) {
      const { fileBytes } = await extractVideoDataFromBlobPath(video.url);

      let urlToDelete: string | undefined;
      let videoUrlToDelete: string | undefined;

      if (video.url.includes(video.id)) {
        // Anonymize storage url on update if necessary by
        // re-running image upload transfer logic
        const { url, videoUrl } = await convertUploadToVideo({
          urlOrigin: video.url,
          videoUrlOrigin: video.videoUrl,
          fileBytes,
          shouldDeleteOrigin: false,
        });
        if (url && videoUrl) {
          urlToDelete = video.url;
          videoUrlToDelete = video.videoUrl;
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

        if (videoUrlToDelete) {
          await deleteFile(videoUrlToDelete);
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
    ? runAuthenticatedAdminServerAction(() => getVideosWithMasks(options))
    : getVideosWithMasks(options);

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
