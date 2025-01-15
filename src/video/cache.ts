import { revalidatePath, revalidateTag, unstable_cache, unstable_noStore } from 'next/cache';
import {
  PATHS_ADMIN,
  PATHS_TO_CACHE,
  PATH_ADMIN,
  PATH_VIDEO_FEED,
  PATH_VIDEO_GRID,
  PATH_ROOT,
  PREFIX_TAG,
  pathForVideo,
} from '@/site/paths';
import {
  getUniqueTags,
  getUniqueTagsHidden,
  getVideo,
  getVideos,
  getVideosMeta,
  getVideosMostRecentUpdate,
  getVideosNearId,
  VideoQueryOptions,
} from '@/db/video_orm';

// Table key
const KEY_VIDEOS = 'videos';
const KEY_VIDEO = 'video';
// Field keys
const KEY_TAGS = 'tags';

// Type keys
const KEY_COUNT = 'count';
const KEY_HIDDEN = 'hidden';
const KEY_DATE_RANGE = 'date-range';

export const getVideosCacheKeys = (options: VideoQueryOptions) => {
  const key: string[] = [];

  if (options.filter) {
    key.push(`filter-${JSON.stringify(options.filter)}`);
  }
  if (options.sort) {
    key.push(`sort-${JSON.stringify(options.sort)}`);
  }
  if (options.limit) {
    key.push(`limit-${options.limit}`);
  }
  if (options.offset) {
    key.push(`offset-${options.offset}`);
  }

  return key.join(',');
};

export const revalidateVideosKey = () => revalidateTag(KEY_VIDEOS);

export const revalidateTagsKey = () => revalidateTag(KEY_TAGS);

export const revalidateAllKeys = () => {
  revalidateVideosKey();
  revalidateTagsKey();
};

export const revalidateAdminPaths = () => {
  for (const path of PATHS_ADMIN) revalidatePath(path);
};

export const revalidateAllKeysAndPaths = async () => {
  revalidateAllKeys();
  for (const path of PATHS_TO_CACHE) revalidatePath(path, 'layout');
};

export const revalidateVideo = (videoId: string) => {
  // Tags
  revalidateTag(videoId);
  revalidateTagsKey();
  // Paths
  revalidatePath(pathForVideo({ video: videoId }), 'layout');
  revalidatePath(PATH_ROOT, 'layout');
  revalidatePath(PATH_VIDEO_GRID, 'layout');
  revalidatePath(PATH_VIDEO_FEED, 'layout');
  revalidatePath(PREFIX_TAG, 'layout');
  revalidatePath(PATH_ADMIN, 'layout');
};

// Cache

export const getVideosCached = (...args: Parameters<typeof getVideos>) =>
  unstable_cache(getVideos, [KEY_VIDEOS, ...getVideosCacheKeys(...args)])(...args);

export const getVideosNearIdCached = (...args: Parameters<typeof getVideosNearId>) =>
  unstable_cache(getVideosNearId, [KEY_VIDEOS, ...getVideosCacheKeys(args[1])])(...args).then(
    ({ videos, indexNumber }) => {
      const [videoId, { limit }] = args;
      const video = videos.find(({ id }) => id === videoId);
      const isVideoFirst = videos.findIndex(p => p.id === videoId) === 0;
      return {
        video: video,
        videos: videos,
        ...(limit && {
          videosGrid: videos.slice(isVideoFirst ? 1 : 2, isVideoFirst ? limit - 1 : limit),
        }),
        indexNumber,
      };
    },
  );

export const getVideosMetaCached = (...args: Parameters<typeof getVideosMeta>) =>
  unstable_cache(getVideosMeta, [
    KEY_VIDEOS,
    KEY_COUNT,
    KEY_DATE_RANGE,
    ...getVideosCacheKeys(...args),
  ])(...args);

export const getVideosMostRecentUpdateCached = unstable_cache(
  () => getVideosMostRecentUpdate(),
  [KEY_VIDEOS, KEY_COUNT, KEY_DATE_RANGE],
);

export const getVideoCached = (...args: Parameters<typeof getVideo>) =>
  unstable_cache(getVideo, [KEY_VIDEOS, KEY_VIDEO])(...args);

export const getUniqueTagsCached = unstable_cache(getUniqueTags, [KEY_VIDEOS, KEY_TAGS]);

export const getUniqueTagsHiddenCached = unstable_cache(getUniqueTagsHidden, [
  KEY_VIDEOS,
  KEY_TAGS,
  KEY_HIDDEN,
]);

// No store
export const getVideosNoStore = (...args: Parameters<typeof getVideos>) => {
  unstable_noStore();
  return getVideos(...args);
};

export const getVideoNoStore = (...args: Parameters<typeof getVideo>) => {
  unstable_noStore();
  return getVideo(...args);
};
