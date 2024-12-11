import {videos} from "@/db/schema";
import {db} from "@/db";
import { eq } from "drizzle-orm";

export type VideoDbNew = typeof videos.$inferInsert;
export type VideoDb = typeof videos.$inferSelect;
export type VideoDbUpd = Omit<VideoDb, 'createdAt' | 'updatedAt'>;

export const insertVideo = async (video: VideoDbNew) => {
  return db.insert(videos).values(video);
}

export const updateVideo = async (video: VideoDbUpd) => {
  return db.update(videos).set(video).where(eq(videos.id, video.id));
}