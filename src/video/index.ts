import { Video, VideoDb, VideoDbNew } from '@/db/video_orm';
import { getNextImageUrlForRequest } from '@/services/next-image';
import { HIGH_DENSITY_GRID } from '@/site/config';
import { ABSOLUTE_PATH_FOR_HOME_IMAGE } from '@/site/paths';
import { formatDate, formatDateFromPostgresString } from '@/utility/date';
import { parameterize } from '@/utility/string';
import { isBefore } from 'date-fns';
import type { Metadata } from 'next';

export const OUTDATED_THRESHOLD = new Date('2024-06-16');

// INFINITE SCROLL: FEED
export const INFINITE_SCROLL_FEED_INITIAL =
  process.env.NODE_ENV === 'development' ? 2 : 12;
export const INFINITE_SCROLL_FEED_MULTIPLE =
  process.env.NODE_ENV === 'development' ? 2 : 24;

// INFINITE SCROLL: GRID
export const INFINITE_SCROLL_GRID_INITIAL = HIGH_DENSITY_GRID
  ? process.env.NODE_ENV === 'development'
    ? 12
    : 24
  : process.env.NODE_ENV === 'development'
    ? 12
    : 24;
export const INFINITE_SCROLL_GRID_MULTIPLE = HIGH_DENSITY_GRID
  ? process.env.NODE_ENV === 'development'
    ? 12
    : 48
  : process.env.NODE_ENV === 'development'
    ? 12
    : 48;

// Thumbnails below /v/[videoId]
export const RELATED_GRID_PHOTOS_TO_SHOW = 12;

export const DEFAULT_ASPECT_RATIO = 1.5;

export const ACCEPTED_VIDEO_FILE_TYPES = ['video/mp4'];

export const MAX_VIDEO_UPLOAD_SIZE_IN_BYTES = 70 * 1024 * 1024; // 70 MB

export type VideoSetAttributes = {
  tag?: string;
};

export const convertVideoToVideoDbInsert = (video: Video): VideoDbNew => ({
  ...video,

  longitude: video.longitude ?? null,
  latitude: video.latitude ?? null,
  locationName: video.locationName ?? null,
  hidden: video.hidden ?? false,
  caption: video.caption ?? null,
  title: video.title ?? null,
  takenAt: video.takenAt,
});

export const descriptionForVideo = (video: Video) =>
  formatDate(video.takenAt)?.toUpperCase();

export const getPreviousVideo = (video: Video, videos: Video[]) => {
  const index = videos.findIndex(p => p.id === video.id);
  return index > 0 ? videos[index - 1] : undefined;
};

export const getNextVideo = (video: Video, videos: Video[]) => {
  const index = videos.findIndex(p => p.id === video.id);
  return index < videos.length - 1 ? videos[index + 1] : undefined;
};

export const generateOgImageMetaForVideos = (videos: Video[]): Metadata => {
  if (videos.length > 0) {
    return {
      openGraph: {
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
      twitter: {
        card: 'summary_large_image',
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
    };
  } else {
    // If there are no videos, refrain from showing an OG image
    return {};
  }
};

const PHOTO_ID_FORWARDING_TABLE: Record<string, string> = JSON.parse(
  process.env.PHOTO_ID_FORWARDING_TABLE || '{}',
);

export const translateVideoId = (id: string) =>
  PHOTO_ID_FORWARDING_TABLE[id] || id;

export const titleForVideo = (
  video: Video,
  preferDateOverUntitled?: boolean,
) => {
  if (video.title) {
    return video.title;
  } else if (preferDateOverUntitled && (video.takenAt || video.createdAt)) {
    return formatDate(video.takenAt || video.createdAt, 'tiny');
  } else {
    return 'Untitled';
  }
};

export const altTextForVideo = (video: Video) => titleForVideo(video);

export const videoLabelForCount = (count: number, capitalize = true) =>
  capitalize
    ? count === 1
      ? 'Video'
      : 'Videos'
    : count === 1
      ? 'video'
      : 'videos';

export const videoQuantityText = (
  count: number,
  includeParentheses = true,
  capitalize?: boolean,
) =>
  includeParentheses
    ? `(${count} ${videoLabelForCount(count, capitalize)})`
    : `${count} ${videoLabelForCount(count, capitalize)}`;

export const deleteConfirmationTextForVideo = (video: Video) =>
  `Are you sure you want to delete "${titleForVideo(video)}?"`;

export type VideoDateRange = { start: Date; end: Date };

export const descriptionForVideoSet = (
  videos: Video[] = [],
  descriptor?: string,
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: VideoDateRange,
) =>
  dateBased
    ? dateRangeForVideos(videos, explicitDateRange).description.toUpperCase()
    : [
        explicitCount ?? videos.length,
        descriptor,
        videoLabelForCount(explicitCount ?? videos.length, false),
      ].join(' ');

const sortVideosByDate = (videos: Video[], order: 'ASC' | 'DESC' = 'DESC') =>
  [...videos].sort((a, b) =>
    order === 'DESC'
      ? b.takenAt.getTime() - a.takenAt.getTime()
      : a.takenAt.getTime() - b.takenAt.getTime(),
  );

export const dateRangeForVideos = (
  videos: Video[] = [],
  explicitDateRange?: VideoDateRange,
) => {
  let start = '';
  let end = '';
  let description = '';

  if (explicitDateRange || videos.length > 0) {
    const videosSorted = sortVideosByDate(videos);
    start = formatDate(
      explicitDateRange?.start ?? videosSorted[videos.length - 1].takenAt,
      'short',
    );
    end = formatDate(
      explicitDateRange?.end ?? videosSorted[0].takenAt,
      'short',
    );
    description = start === end ? start : `${start}–${end}`;
  }

  return { start, end, description };
};

export const getKeywordsForVideo = (video: Video) =>
  (video.caption ?? '')
    .split(' ')
    .filter(Boolean)
    .map(keyword => keyword.toLocaleLowerCase());

export const isNextImageReadyBasedOnVideos = async (videos: Video[]) =>
  videos.length > 0 &&
  fetch(getNextImageUrlForRequest(videos[0].url, 640))
    .then(response => response.ok)
    .catch(() => false);

export const downloadFileNameForVideo = (video: Video) =>
  video.title
    ? `${parameterize(video.title)}.${video.extension}`
    : video.url.split('/').pop() || 'download';

export const doesVideoNeedBlurCompatibility = (video: Video) =>
  isBefore(video.updatedAt, new Date('2024-05-07'));
