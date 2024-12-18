import {
  pgTable,
  varchar,
  real,
  text,
  smallint,
  doublePrecision,
  timestamp,
  boolean,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const photos = pgTable('photos', {
  id: varchar({ length: 8 }).primaryKey().notNull(),
  url: varchar({ length: 255 }).notNull(),
  extension: varchar({ length: 255 }).notNull(),
  aspectRatio: real('aspect_ratio').default(1.5),
  blurData: text('blur_data'),
  title: varchar({ length: 255 }),
  caption: text(),
  semanticDescription: text('semantic_description'),
  tags: varchar({ length: 255 }).array(),
  make: varchar({ length: 255 }),
  model: varchar({ length: 255 }),
  focalLength: smallint('focal_length'),
  focalLengthIn35MmFormat: smallint('focal_length_in_35mm_format'),
  lensMake: varchar('lens_make', { length: 255 }),
  lensModel: varchar('lens_model', { length: 255 }),
  fNumber: real('f_number'),
  iso: smallint(),
  exposureTime: doublePrecision('exposure_time'),
  exposureCompensation: real('exposure_compensation'),
  locationName: varchar('location_name', { length: 255 }),
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  filmSimulation: varchar('film_simulation', { length: 255 }),
  priorityOrder: real('priority_order'),
  takenAt: timestamp('taken_at', { withTimezone: true, mode: 'string' }).notNull(),
  takenAtNaive: varchar('taken_at_naive', { length: 255 }).notNull(),
  hidden: boolean(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

const video = pgTable(
  'video',
  {
    id: varchar({ length: 8 }).primaryKey().notNull(),
    url: varchar({ length: 255 }).notNull(),
    extension: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    caption: text().notNull(),
    tags: varchar({ length: 255 }).array().notNull(),
    locationName: varchar('location_name', { length: 255 }).default('').notNull(),
    takenAt: timestamp('taken_at', { withTimezone: true, mode: 'date' }).notNull(),
    hidden: boolean().default(false).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    thumbnailUrl: varchar('thumbnail_url', { length: 255 }).notNull(),
  },
  table => [
    check('check_thumbnail_url', sql`(thumbnail_url)::text ~ '^https://.+\.[A-Za-z0-9]+$'::text`),
    check('check_url', sql`(url)::text ~ '^https://.+\.[A-Za-z0-9]+$'::text`),
  ],
);

export const tb = {
  photo: photos,
  video,
};
