import {
  getUniqueCamerasCached,
  getUniqueFilmSimulationsCached,
  getUniqueTagsCached,
} from '@/photo/cache';
import {
  getUniqueCameras,
  getUniqueFilmSimulations,
  getUniqueTags,
} from '@/photo/db/query';
import { SHOW_FILM_SIMULATIONS } from '@/site/config';
import { sortTagsObject } from '@/tag';

export const getVideoSidebarData = () =>
  [
    getUniqueTags()
      .then(sortTagsObject)
      .catch(() => []),
    getUniqueCameras().catch(() => []),
    SHOW_FILM_SIMULATIONS ? getUniqueFilmSimulations().catch(() => []) : [],
  ] as const;

export const getVideoSidebarDataCached = () =>
  [
    getUniqueTagsCached().then(sortTagsObject),
    getUniqueCamerasCached(),
    SHOW_FILM_SIMULATIONS ? getUniqueFilmSimulationsCached() : [],
  ] as const;
