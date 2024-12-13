import { photosTable } from '@/db/generated/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';

export type PhotoDbNew = typeof photosTable.$inferInsert;
export type PhotoDb = typeof photosTable.$inferSelect;

export type PhotoDbUpd = Omit<PhotoDb, 'createdAt' | 'updatedAt'>;

export const insertPhoto = async (photo: PhotoDbNew) => {
  return db.insert(photosTable).values(photo);
};

export const updatePhoto = async (photo: PhotoDbUpd) => {
  return db.update(photosTable).set(photo).where(eq(photosTable.id, photo.id));
};
