import { SHOW_FILM_SIMULATIONS } from '@/site/config';
import { sortTagsObject } from '@/tag';

export const getVideoSidebarData = () =>
  [
    getUniqueTags()
      .then(sortTagsObject)
      .catch(() => []),
  ] as const;

export const getVideoSidebarDataCached = () =>
  [getUniqueTagsCached().then(sortTagsObject)] as const;
