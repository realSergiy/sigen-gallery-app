'use client';

import { deleteConfirmationTextForVideo, titleForVideo } from '@/video';
import DeleteVideosButton from './DeleteVideosButton';
import { ComponentProps } from 'react';
import { Video } from '@/db/video_orm';

export default function DeleteVideoButton({
  video,
  ...rest
}: {
  video: Video;
} & ComponentProps<typeof DeleteVideosButton>) {
  return (
    <DeleteVideosButton
      {...rest}
      videoIds={[video.id]}
      confirmText={deleteConfirmationTextForVideo(video)}
      toastText={`"${titleForVideo(video)}" deleted`}
    />
  );
}
