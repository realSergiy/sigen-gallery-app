'use client';

import VideoUpload from '@/video/VideoUpload';
import { clsx } from 'clsx/lite';
import SiteGrid from '@/components/SiteGrid';
import { AI_TEXT_GENERATION_ENABLED, PRO_MODE_ENABLED } from '@/site/config';
import AdminVideosTable from '@/admin/AdminVideosTable';
import AdminVideosTableInfinite from '@/admin/AdminVideosTableInfinite';
import PathLoaderButton from '@/components/primitives/PathLoaderButton';
import { PATH_ADMIN_OUTDATED } from '@/site/paths';
import { Video } from '@/db/video_orm';
import { StorageListResponse } from '@/services/storage';
import { useState } from 'react';
import { LiaBroomSolid } from 'react-icons/lia';
import AdminUploadsTable from './AdminUploadsTable';

type AdminVideosClientProps = {
  videos: Video[];
  videosCount: number;
  videosCountOutdated: number;
  onLastVideoUpload: () => Promise<void>;
  blobVideoUrls: StorageListResponse;
  infiniteScrollInitial: number;
  infiniteScrollMultiple: number;
};

export default function AdminVideosClient({
  videos,
  videosCount,
  videosCountOutdated,
  onLastVideoUpload,
  blobVideoUrls,
  infiniteScrollInitial,
  infiniteScrollMultiple,
}: AdminVideosClientProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <SiteGrid
      contentMain={
        <div className="space-y-4">
          <div className="flex">
            <div className="min-w-0 grow">
              <VideoUpload
                shouldResize={!PRO_MODE_ENABLED}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                onLastUpload={onLastVideoUpload}
              />
            </div>
            {videosCountOutdated > 0 && (
              <PathLoaderButton
                path={PATH_ADMIN_OUTDATED}
                icon={<LiaBroomSolid size={18} className="-translate-y-px" />}
                title={`${videosCountOutdated} Outdated Videos`}
                className={clsx(isUploading && 'hidden md:inline-flex')}
                hideTextOnMobile={false}
              >
                {videosCountOutdated}
              </PathLoaderButton>
            )}
          </div>
          {blobVideoUrls.length > 0 && (
            <div
              className={clsx('border-b pb-6', 'border-gray-200 dark:border-gray-700', 'space-y-4')}
            >
              <div className="font-bold">Video Blobs ({blobVideoUrls.length})</div>
              <AdminUploadsTable urlAddStatuses={blobVideoUrls} />
            </div>
          )}
          {/* Use custom spacing to address gap/space-y compatibility quirks */}
          <div className="space-y-[6px] sm:space-y-[10px]">
            <AdminVideosTable videos={videos} hasAiTextGeneration={AI_TEXT_GENERATION_ENABLED} />
            {videosCount > videos.length && (
              <AdminVideosTableInfinite
                initialOffset={infiniteScrollInitial}
                itemsPerPage={infiniteScrollMultiple}
                hasAiTextGeneration={AI_TEXT_GENERATION_ENABLED}
              />
            )}
          </div>
        </div>
      }
    />
  );
}
