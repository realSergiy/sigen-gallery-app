'use server';

import {
  VideoFormData,
  convertFormDataToVideoDbInsert,
  convertVideoToFormData,
} from './form';
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
import {
  PATH_ADMIN_VIDEOS,
  PATH_ADMIN_TAGS,
  PATH_ROOT,
  pathForVideo,
} from '@/site/paths';
import { blurImageFromUrl, extractImageDataFromBlobPath } from './server';
import { TAG_FAVS, isTagFavs } from '@/tag';
import { convertVideoToVideoDbInsert } from '.';
import { runAuthenticatedAdminServerAction } from '@/auth';

import { convertUploadToVideo } from './storage';
import { UrlAddStatus } from '@/admin/AdminUploadsClient';
import { convertStringToArray } from '@/utility/string';
import { getVideo, insertVideo, updateVideo, Video } from '@/db/video_orm';
import { createStreamableValue } from 'ai/rsc';

// Private actions

export const createVideoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const shouldStripGpsData = formData.get('shouldStripGpsData') === 'true';
    formData.delete('shouldStripGpsData');

    const video = convertFormDataToVideoDbInsert(formData);

    const updatedUrl = await convertUploadToVideo({
      urlOrigin: video.url,
      shouldStripGpsData,
    });

    if (updatedUrl) {
      video.url = updatedUrl;
      await insertVideo(video);
      revalidateAllKeysAndPaths();
      redirect(PATH_ADMIN_VIDEOS);
    }
  });

export const addAllUploadsAction = async ({
  uploadUrls,
  tags,
  takenAtLocal,
}: {
  uploadUrls: string[];
  tags?: string;
  takenAtLocal: string;
}) =>
  runAuthenticatedAdminServerAction(async () => {
    const PROGRESS_TASK_COUNT = 4;

    const addedUploadUrls: string[] = [];
    let currentUploadUrl = '';
    let progress = 0;

    const stream = createStreamableValue<UrlAddStatus>();

    const streamUpdate = (
      statusMessage: string,
      status: UrlAddStatus['status'] = 'adding',
    ) =>
      stream.update({
        url: currentUploadUrl,
        status,
        statusMessage,
        progress: ++progress / PROGRESS_TASK_COUNT,
      });

    (async () => {
      try {
        for (const url of uploadUrls) {
          currentUploadUrl = url;
          progress = 0;
          streamUpdate('Parsing EXIF data');

          const {
            videoFormExif,
            imageResizedBase64,
            shouldStripGpsData,
            fileBytes,
          } = await extractImageDataFromBlobPath(url, {
            includeInitialVideoFields: true,
            generateBlurData: BLUR_ENABLED,
            generateResizedImage: AI_TEXT_GENERATION_ENABLED,
          });

          if (videoFormExif) {
            const {
              title,
              caption,
              tags: aiTags,
              semanticDescription,
            } = await generateAiImageQueries(
              imageResizedBase64,
              AI_TEXT_AUTO_GENERATED_FIELDS,
            );

            const form: Partial<VideoFormData> = {
              ...videoFormExif,
              title,
              caption,
              tags,
              takenAt: videoFormExif.takenAt || takenAtLocal,
            };

            streamUpdate('Transferring to video storage');

            const updatedUrl = await convertUploadToVideo({
              urlOrigin: url,
              fileBytes,
              shouldStripGpsData,
            });
            if (updatedUrl) {
              const subheadFinal = 'Adding to database';
              streamUpdate(subheadFinal);
              const video = convertFormDataToVideoDbInsert(form);
              video.url = updatedUrl;
              await insertVideo(video);
              addedUploadUrls.push(url);
              // Re-submit with updated url
              streamUpdate(subheadFinal, 'added');
            }
          }
        }
      } catch (error: any) {
        // eslint-disable-next-line max-len
        stream.error(
          `${error.message} (${addedUploadUrls.length} of ${uploadUrls.length} videos successfully added)`,
        );
      }
      revalidateAllKeysAndPaths();
      stream.done();
    })();

    return stream.value;
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

    redirect(PATH_ADMIN_PHOTOS);
  });

export const tagMultipleVideosAction = (tags: string, videoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    await addTagsToVideos(convertStringToArray(tags, false) ?? [], videoIds);
    revalidateAllKeysAndPaths();
  });

export const toggleFavoriteVideoAction = async (
  videoId: string,
  shouldRedirect?: boolean,
) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId);
    if (video) {
      const { tags } = video;
      video.tags = tags.some(tag => tag === TAG_FAVS)
        ? tags.filter(tag => !isTagFavs(tag))
        : [...tags, TAG_FAVS];
      await updateVideo(convertVideoToVideoDbInsert(video));
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

// Accessed from admin video edit page
// will not update blur data
export const getExifDataAction = async (
  url: string,
): Promise<Partial<VideoFormData>> =>
  runAuthenticatedAdminServerAction(async () => {
    const { videoFormExif } = await extractImageDataFromBlobPath(url);
    if (videoFormExif) {
      return videoFormExif;
    } else {
      return {};
    }
  });

// Accessed from admin video table, will:
// - update EXIF data
// - anonymize storage url if necessary
// - strip GPS data if necessary
// - update blur data (or destroy if blur is disabled)
// - generate AI text data, if enabled, and auto-generated fields are empty
export const syncVideoAction = async (videoId: string) =>
  runAuthenticatedAdminServerAction(async () => {
    const video = await getVideo(videoId ?? '', true);

    if (video) {
      const {
        videoFormExif,
        imageResizedBase64,
        shouldStripGpsData,
        fileBytes,
      } = await extractImageDataFromBlobPath(video.url, {
        includeInitialVideoFields: false,
        generateBlurData: BLUR_ENABLED,
        generateResizedImage: AI_TEXT_GENERATION_ENABLED,
      });

      let urlToDelete: string | undefined;
      if (videoFormExif) {
        if (video.url.includes(video.id) || shouldStripGpsData) {
          // Anonymize storage url on update if necessary by
          // re-running image upload transfer logic
          const url = await convertUploadToVideo({
            urlOrigin: video.url,
            fileBytes,
            shouldStripGpsData,
            shouldDeleteOrigin: false,
          });
          if (url) {
            urlToDelete = video.url;
            video.url = url;
          }
        }

        const {
          title: atTitle,
          caption: aiCaption,
          tags: aiTags,
          semanticDescription: aiSemanticDescription,
        } = await generateAiImageQueries(
          imageResizedBase64,
          AI_TEXT_AUTO_GENERATED_FIELDS,
        );

        const videoFormDbInsert = convertFormDataToVideoDbInsert({
          ...convertVideoToFormData(video),
          ...videoFormExif,
          ...(!BLUR_ENABLED && { blurData: undefined }),
          ...(!video.title && { title: atTitle }),
          ...(!video.caption && { caption: aiCaption }),
          ...(video.tags.length === 0 && { tags: aiTags }),
          ...(!video.semanticDescription && {
            semanticDescription: aiSemanticDescription,
          }),
        });

        await updateVideo(videoFormDbInsert).then(async () => {
          if (urlToDelete) {
            await deleteFile(urlToDelete);
          }
        });

        revalidateAllKeysAndPaths();
      }
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

export const streamAiImageQueryAction = async (
  imageBase64: string,
  query: AiImageQuery,
) =>
  runAuthenticatedAdminServerAction(() =>
    streamOpenAiImageQuery(imageBase64, AI_IMAGE_QUERIES[query]),
  );

export const getImageBlurAction = async (url: string) =>
  runAuthenticatedAdminServerAction(() => blurImageFromUrl(url));

export const getVideosHiddenMetaCachedAction = async () =>
  runAuthenticatedAdminServerAction(() =>
    getVideosMetaCached({ hidden: 'only' }),
  );

// Public/Private actions

export const getVideosAction = async (options: GetVideosOptions) =>
  areOptionsSensitive(options)
    ? runAuthenticatedAdminServerAction(() => getVideos(options))
    : getVideos(options);

export const getVideosCachedAction = async (options: GetVideosOptions) =>
  areOptionsSensitive(options)
    ? runAuthenticatedAdminServerAction(() => getVideosCached(options))
    : getVideosCached(options);

// Public actions

export const searchVideosAction = async (query: string) =>
  getVideos({ query, limit: 10 }).catch(e => {
    console.error('Could not query videos', e);
    return [] as Video[];
  });
