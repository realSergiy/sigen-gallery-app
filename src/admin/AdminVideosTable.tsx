'use client';

import { titleForVideo } from '@/video';
import AdminTable from './AdminTable';
import { Fragment } from 'react';
import { clsx } from 'clsx/lite';
import { pathForAdminVideoEdit, pathForVideo } from '@/site/paths';
import Link from 'next/link';
import { AiOutlineEyeInvisible } from 'react-icons/ai';
import VideoDate from '@/video/VideoDate';
import EditButton from './EditButton';
import { useAppState } from '@/state/AppState';
import { RevalidateVideo } from '@/video/InfiniteVideoScroll';
import VideoSyncButton from './VideoSyncButton';

import { Video } from '@/db/video_orm';
import DeleteVideoButton from './DeleteVideoButton';
import VideoLinkSmall from '@/video/VideoLinkSmall';

export default function AdminVideosTable({
  videos,
  onLastVideoVisible,
  revalidateVideo,
  videoIdsSyncing = [],
  showUpdatedAt,
  canEdit = true,
  canDelete = true,
}: {
  videos: Video[];
  onLastVideoVisible?: () => void;
  revalidateVideo?: RevalidateVideo;
  videoIdsSyncing?: string[];
  hasAiTextGeneration: boolean;
  showUpdatedAt?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const { invalidateSwr } = useAppState();

  const opacityForVideoId = (videoId: string) =>
    videoIdsSyncing.length > 0 && !videoIdsSyncing.includes(videoId) ? 'opacity-40' : undefined;

  return (
    <AdminTable>
      {videos.map((video, index) => (
        <Fragment key={video.id}>
          <VideoLinkSmall
            video={video}
            onVisible={index === videos.length - 1 ? onLastVideoVisible : undefined}
            className={opacityForVideoId(video.id)}
          />
          <div className={clsx('flex flex-col lg:flex-row', opacityForVideoId(video.id))}>
            <Link
              key={video.id}
              href={pathForVideo({ video })}
              className="flex items-center gap-2 lg:w-1/2"
              prefetch={false}
            >
              <span className={clsx(video.hidden && 'text-dim')}>
                {titleForVideo(video)}
                {video.hidden && (
                  <span className="whitespace-nowrap">
                    {' '}
                    <AiOutlineEyeInvisible className="inline translate-y-[-0.5px]" size={16} />
                  </span>
                )}
              </span>
            </Link>
            <div className={clsx('text-dim uppercase lg:w-1/2')}>
              <VideoDate
                {...{
                  video,
                  dateType: showUpdatedAt ? 'updatedAt' : 'createdAt',
                }}
              />
            </div>
          </div>
          <div className={clsx('flex flex-nowrap items-center gap-2 sm:gap-3')}>
            {canEdit && <EditButton path={pathForAdminVideoEdit(video)} />}
            <VideoSyncButton
              videoId={video.id}
              videoTitle={titleForVideo(video)}
              onSyncComplete={invalidateSwr}
              isSyncingExternal={videoIdsSyncing.includes(video.id)}
              disabled={videoIdsSyncing.length > 0}
              className={opacityForVideoId(video.id)}
              shouldConfirm
              shouldToast
            />
            {canDelete && (
              <DeleteVideoButton video={video} onDelete={() => revalidateVideo?.(video.id, true)} />
            )}
          </div>
        </Fragment>
      ))}
    </AdminTable>
  );
}
