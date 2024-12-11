import {videos} from "@/db/schema";
import {db} from "@/db";
import { eq } from "drizzle-orm";

export type VideoDbNew = typeof videos.$inferInsert;
export type VideoDb = typeof videos.$inferSelect;
export type VideoDbUpd = Omit<VideoDb, 'createdAt' | 'updatedAt'>;

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
  }

export const insertVideo = async (video: VideoDbNew) => {
  return db.insert(videos).values(video);
}

export const updateVideo = async (video: VideoDbUpd) => {
  return db.update(videos).set(video).where(eq(videos.id, video.id));
}