import { relations } from 'drizzle-orm';
import { tb } from './generated/schema';

export const video = tb.video;
export const videoMask = tb.videoMask;

export const videoRelations = relations(video, ({ many }) => ({
  videoMask: many(videoMask),
}));

export const videoMaskRelations = relations(videoMask, ({ one }) => ({
  video: one(video, {
    fields: [videoMask.videoId],
    references: [video.id],
  }),
}));
