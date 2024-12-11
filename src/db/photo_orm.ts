import {photos} from "@/db/schema";
import {db} from "@/db";
import { eq } from "drizzle-orm";

export type PhotoDbNew = typeof photos.$inferInsert;
export type PhotoDb = typeof photos.$inferSelect;

export type PhotoDbUpd = Omit<PhotoDb, 'createdAt' | 'updatedAt'>;

export const insertPhoto = async (photo: PhotoDbNew) => {
  return db.insert(photos).values(photo);
}

export const updatePhoto = async (photo: PhotoDbUpd) => {
  return db.update(photos).set(photo).where(eq(photos.id, photo.id));
}
