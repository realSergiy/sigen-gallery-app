import { tb } from '@/db/generated/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';

export type PhotoDbNew = typeof tb.photo.$inferInsert;
export type PhotoDb = typeof tb.photo.$inferSelect;

export type PhotoDbUpd = Omit<PhotoDb, 'createdAt' | 'updatedAt'>;

export const insertPhoto = async (photo: PhotoDbNew) => {
  return db.insert(tb.photo).values(photo);
};

export const updatePhoto = async (photo: PhotoDbUpd) => {
  return db.update(tb.photo).set(photo).where(eq(tb.photo.id, photo.id));
};
