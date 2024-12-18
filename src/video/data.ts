import { getUniqueTags } from '@/db/video_orm';
import { sortTagsObject } from '@/tag';
import { getUniqueTagsCached } from './cache';

export const getVideoSidebarData = () =>
  [
    getUniqueTags()
      .then(sortTagsObject)
      .catch(() => []),
  ] as const;

export const getVideoSidebarDataCached = () =>
  [getUniqueTagsCached().then(sortTagsObject)] as const;
