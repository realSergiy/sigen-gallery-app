import { relations } from 'drizzle-orm/relations';
import { tb } from './schema';

const { video, videoMask } = tb;

export const videoMaskRelations = relations(videoMask, ({ one }) => ({
  video: one(video, {
    fields: [videoMask.videoId],
    references: [video.id],
  }),
}));

export const videoRelations = relations(video, ({ many }) => ({
  videoMasks: many(videoMask),
}));
