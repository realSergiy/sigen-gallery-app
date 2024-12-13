import { videosTable } from '@/db/generated/schema';
import { db } from '@/db';
import { count, desc, eq, max, min } from 'drizzle-orm';

export type VideoDbNew = Omit<
  typeof videosTable.$inferInsert,
  'createdAt' | 'updatedAt'
>;
export type VideoDb = typeof videosTable.$inferSelect;
export type VideoDbUpd = Omit<VideoDb, 'createdAt' | 'updatedAt'>;

type ReplaceNullWithUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

export type Video = ReplaceNullWithUndefined<VideoDb>;

/*
export type GetVideosOptions = {
  sortBy?: 'createdAt' | 'createdAtAsc' | 'takenAt' | 'priority';
  limit?: number;
  offset?: number;
  query?: string;
  takenBefore?: Date;
  takenAfterInclusive?: Date;
  updatedBefore?: Date;
  hidden?: 'exclude' | 'include' | 'only';
} & VideoSetAttributes;

export type VideoSetAttributes = {
  tag?: string;
};
*/

const videosWhereQuery = db.select().from(videosTable).where;
const videosSortQuery = db.select().from(videosTable).orderBy;

export type VideosFilter = Parameters<typeof videosWhereQuery>[0];
export type VideosOrderBy = Parameters<typeof videosSortQuery>[1];

export const getVideos = async (options: {
  filter?: VideosFilter;
  sort?: VideosOrderBy;
  limit?: number;
}) => {
  const query = db.select().from(videosTable);
  if (options.filter) {
    query.where(options.filter);
  }
  if (options.sort) {
    query.orderBy(options.sort);
  }
  if (options.limit) {
    query.limit(options.limit);
  }
  return query;
};

export const insertVideo = async (video: VideoDbNew) => {
  return db.insert(videosTable).values(video);
};

export const updateVideo = async (video: VideoDbUpd) => {
  return db.update(videosTable).set(video).where(eq(videosTable.id, video.id));
};

const metaQuery = db
  .select({
    count: count(),
    start: min(videosTable.takenAt),
    end: max(videosTable.takenAt),
  })
  .from(videosTable);

export type VideosMetaFilter = Parameters<typeof metaQuery.where>[0];

export const getVideosMeta = async (filters?: VideosMetaFilter) => {
  const query = metaQuery;
  if (filters) {
    query.where(filters);
  }
  const rows = await query;
  const row = rows[0];

  return {
    count: row.count,
    dateRange:
      row.start && row.end ? { start: row.start, end: row.end } : undefined,
  };
};
