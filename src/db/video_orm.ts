import { tb } from '@/db/generated/schema';
import { db } from '@/db';
import { count, and, eq, ne, max, min, desc, sql, inArray, lt } from 'drizzle-orm';
import type { TagInfo } from '@/tag';
import { convertArrayToPostgresString } from '@/services/postgres';
import { OUTDATED_THRESHOLD } from '@/media';
import { createLogOp } from '@/utility/logging';

const logger = console;
const logOp = createLogOp(logger);

export type VideoDbNew = Omit<typeof tb.video.$inferInsert, 'createdAt' | 'updatedAt'>;
export type VideoDb = typeof tb.video.$inferSelect;
export type VideoDbUpd = Omit<VideoDb, 'createdAt' | 'updatedAt'>;

type ReplaceNullWithUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

export type Video = ReplaceNullWithUndefined<VideoDb>;

const sqNeHidden = db.$with('sq').as(db.select().from(tb.video).where(ne(tb.video.hidden, true)));

const sqAll = db.$with('sq').as(db.select().from(tb.video));
const sqHidden = db.$with('sq').as(db.select().from(tb.video).where(eq(tb.video.hidden, true)));

export type VideoQueryOptions = {
  filter?: 'outdatedOnly';
  sort?: 'createdAt' | 'updatedAt' | 'takenAt';
  limit?: number;
  offset?: number;
  hidden?: 'exclude' | 'include' | 'only';
};

const getSq = (options: VideoQueryOptions) => {
  const hidden = options.hidden ?? 'exclude';
  return hidden === 'exclude' ? sqNeHidden : hidden === 'include' ? sqAll : sqHidden;
};

const parseOptions = (options: VideoQueryOptions) => {
  const sq = getSq(options);

  const filter =
    options.filter === 'outdatedOnly' ? lt(tb.video.updatedAt, OUTDATED_THRESHOLD) : undefined;

  const sort = desc(options.sort ? tb.video[options.sort] : sq.takenAt);

  return { sq, filter, sort };
};

export const getVideos = logOp(async (options: VideoQueryOptions) => ({
  name: 'getVideos',
  resultFormat: result => `${result.length} videos`,
  op: async () => {
    const { sq, filter, sort } = parseOptions(options);

    const rows = await db
      .with(sq)
      .select()
      .from(sq)
      .where(filter)
      .orderBy(sort)
      .limit(options.limit ?? 1000)
      .offset(options.offset ?? 0);

    return rows;
  },
}));

export const getVideosMostRecentUpdate = async () => {
  return db
    .select({
      updatedAt: max(tb.video.updatedAt),
    })
    .from(tb.video)
    .then(rows => rows[0].updatedAt);
};

export const getUniqueTags = async () => getUniqueTagsCore(false);
export const getUniqueTagsHidden = async () => getUniqueTagsCore(true);

const getUniqueTagsCore = async (includeHidden: boolean) => {
  const video = tb.video;
  const { tags, hidden } = tb.video;

  const query = includeHidden
    ? sql`
      select distinct unnest(${tags}) as tag, count(*)
      from ${video}
      group by tag
      order by tag asc`
    : sql`
      select distinct unnest(${tags}) as tag, count(*)
      from ${video}
      where not ${hidden}
      group by tag
      order by tag asc`;

  const qw = await db.execute<TagInfo>(query);
  return qw.rows;
};

export const getVideosNearId = async (videoId: string, { limit }: VideoQueryOptions) => {
  const video = tb.video;
  const { takenAt, id } = tb.video;

  const _limit = limit ?? 10;

  const sq = await db.execute<{ id: string; row_number: number }>(sql`
      with WIN as (
        select id, row_number()
        over (order by ${takenAt} desc) as row_number
        from ${video}
      ),
      CURR as (
        select row_number from WIN where WIN.id = ${videoId}
      )
      select WIN.*
      from WIN, CURR
      where WIN.row_number >= CURR.row_number - 1
      limit ${_limit}
    `);

  const rows = await db
    .select()
    .from(video)
    .where(
      inArray(
        id,
        sq.rows.map(p => p.id),
      ),
    );

  const row = rows.find(p => p.id === videoId);
  const indexNumber = row ? sq.rows.find(r => r.id === row.id) : undefined;
  return {
    videos: rows,
    indexNumber,
  };
};

export const getVideoIds = async ({ limit }: { limit?: number }) =>
  db
    .select({ id: tb.video.id })
    .from(tb.video)
    .limit(limit ?? 1000);

export const getVideo = async (id: string, includeHidden = false) => {
  if (!id) {
    return;
  }

  const filter = includeHidden
    ? eq(tb.video.id, id)
    : and(eq(tb.video.id, id), eq(tb.video.hidden, false));

  const rows = await db.select().from(tb.video).where(filter);

  return rows.length == 1 ? rows[0] : undefined; // ToDo: log error if > 1
};

export const insertVideo = async (video: VideoDbNew) => {
  return db.insert(tb.video).values(video);
};

export const updateVideo = async (video: VideoDbUpd) => {
  return db.update(tb.video).set(video).where(eq(tb.video.id, video.id));
};

export const getVideosMeta = async (options: VideoQueryOptions) => {
  const { sq, filter } = parseOptions(options);

  const query = db
    .with(sq)
    .select({
      count: count(),
      start: min(tb.video.takenAt),
      end: max(tb.video.takenAt),
    })
    .from(sq)
    .where(filter);

  const rows = await query;
  const row = rows[0];

  return {
    count: row.count,
    dateRange: row.start && row.end ? { start: row.start, end: row.end } : undefined,
  };
};

export const deleteVideo = async (id: string) => {
  return db.delete(tb.video).where(eq(tb.video.id, id));
};

export const addTagsToVideos = async (videoIds: string[], tags: string[]) => {
  const tagsArray = convertArrayToPostgresString(tags);

  return db
    .update(tb.video)
    .set({
      tags: sql`select array_agg(distinct elem) from unnest(array_cat(${tb.video.tags}, ${tagsArray})) elem`,
    })
    .where(sql`${tb.video.id} = any(${videoIds})`);
};

export const deleteVideoTagGlobally = async (tag: string) => {
  return db
    .update(tb.video)
    .set({
      tags: sql`array_remove(${tb.video.tags}, ${tag})`,
    })
    .where(sql`${tag}=ANY(${tb.video.tags})`);
};

export const renameVideoTagGlobally = async (oldTag: string, newTag: string) => {
  return db
    .update(tb.video)
    .set({
      tags: sql`array_replace(${tb.video.tags}, ${oldTag}, ${newTag})`,
    })
    .where(sql`${oldTag}=ANY(${tb.video.tags})`);
};
