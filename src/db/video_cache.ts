export const getVideosMetaCached = (
    ...args: Parameters<typeof getVideosMeta>
  ) =>
    unstable_cache(getVideosMeta, [
      KEY_PHOTOS,
      KEY_COUNT,
      KEY_DATE_RANGE,
      ...getVideosCacheKeys(...args),
    ])(...args);