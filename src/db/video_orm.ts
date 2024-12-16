import { videosTable } from '@/db/generated/schema';
import { db } from '@/db';
import { count, and, eq, max, min, desc, sql } from 'drizzle-orm';
import { TagInfo } from '@/tag';

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

const videosWhereQuery = db.select().from(videosTable).where;
const videosSortQuery = db.select().from(videosTable).orderBy;

export type VideosFilter = Parameters<typeof videosWhereQuery>[0];
export type VideosOrderBy = Parameters<typeof videosSortQuery>[1];

export type GetVideosOptions = {
  filter?: VideosFilter;
  sort?: VideosOrderBy;
  limit?: number;
  offset?: number;
};

export const getVideos = async (options: GetVideosOptions) => {
  const query = db
    .select()
    .from(videosTable)
    .where(options.filter)
    .orderBy(options.sort ?? desc(videosTable.takenAt))
    .limit(options.limit ?? 1000)
    .offset(options.offset ?? 0);

  return query;
};

export const getVideosMostRecentUpdate = async () => {
  return db
    .select({
      updatedAt: max(videosTable.updatedAt),
    })
    .from(videosTable)
    .then(rows => rows[0].updatedAt);
};

export const getUniqueTags = async () => {
  const qw = await db.execute<TagInfo>(sql`
    select distinct unnest(tags) as tag, count(*)
    from videos
    where not hidden
    group by tag
    order by tag asc
  `);

  return qw.rows;
};

export const getUniqueTagsHidden = async () => {
  const qw = await db.execute<TagInfo>(sql`
    select distinct unnest(tags) as tag, count(*)
    from videos
    group by tag
    order by tag asc
  `);

  return qw.rows;
};

export const getVideosNearId = async (videoId: string, limit: number) => {
  const qr = await db.execute<VideoDb & { row_number: number }>(sql`
      with win as (
        select *, row_number()
        over (order by taken_at desc) as row_number
        from videos
      ),
      current as (
        select row_number from win where id = ${videoId}
      )
      select win.*
      from win, current
      where win.row_number >= current.row_number - 1
      limit ${limit}
    `);

  const photo = qr.rows.find(p => p.id === videoId);
  const indexNumber = photo ? photo.row_number : undefined;
  return {
    videos: qr.rows,
    indexNumber,
  };
};

export const getVideo = async (id: string, includeHidden = false) => {
  const filter = includeHidden
    ? eq(videosTable.id, id)
    : and(eq(videosTable.id, id), eq(videosTable.hidden, false));

  const rows = await db.select().from(videosTable).where(filter);

  return rows.length == 1 ? rows[0] : undefined; // ToDo: log error if > 1
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
