import { unstable_cache } from 'next/cache';
import { getVideosMeta } from './video_orm';

// Table key
const KEY_VIDEOS = 'videos';

// Type keys
const KEY_COUNT = 'count';
const KEY_DATE_RANGE = 'date-range';

export const getVideosMetaCached = (...args: Parameters<typeof getVideosMeta>) =>
  unstable_cache(getVideosMeta, [
    KEY_VIDEOS,
    KEY_COUNT,
    KEY_DATE_RANGE,
    //    ...getVideosCacheKeys(...args),
  ])(...args);

// ToDo replace with stable cache and generic cache key generation for any table

/*
const getVideosCacheKeys = (options: GetVideosOptions = {}) => {
  const tags: string[] = [];

  Object.keys(options).forEach(key => {
    const tag = getVideosCacheKeyForOption(
      options,
      key as keyof GetVideosOptions,
    );
    if (tag) {
      tags.push(tag);
    }
  });

  return tags;
};


const getVideosCacheKeyForOption = (
  options: GetVideosOptions,
  option: keyof GetVideosOptions,
): string | null => {
  switch (option) {
    case 'takenBefore':
    case 'takenAfterInclusive':
    case 'updatedBefore': {
      const value = options[option];
      return value ? `${option}-${value.toISOString()}` : null;
    }
    // Primitive keys
    default:
      const value = options[option];
      return value !== undefined ? `${option}-${value}` : null;
  }
};
*/
