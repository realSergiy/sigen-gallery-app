'use client';

import AdminChildPage from '@/components/AdminChildPage';
import { Video } from '.';
import { PATH_ADMIN_PHOTOS } from '@/site/paths';
import { VideoFormData, convertVideoToFormData } from './form';
import VideoForm from './form/VideoForm';
import { Tags } from '@/tag';
import AiButton from './ai/AiButton';
import useVideoFormParent from './form/useVideoFormParent';
import ExifSyncButton from '@/admin/ExifSyncButton';
import { useState } from 'react';

export default function VideoEditPageClient({
  video,
  uniqueTags,
  hasAiTextGeneration,
  imageThumbnailBase64,
  blurData,
}: {
  video: Video;
  uniqueTags: Tags;
  hasAiTextGeneration: boolean;
  imageThumbnailBase64: string;
  blurData: string;
}) {
  const videoForm = convertVideoToFormData(video);

  const {
    pending,
    setIsPending,
    updatedTitle,
    setUpdatedTitle,
    hasTextContent,
    setHasTextContent,
    aiContent,
  } = useVideoFormParent({
    videoForm,
    imageThumbnailBase64,
  });

  const [updatedExifData, setUpdatedExifData] =
    useState<Partial<VideoFormData>>();

  return (
    <AdminChildPage
      backPath={PATH_ADMIN_PHOTOS}
      backLabel="Videos"
      breadcrumb={
        pending && updatedTitle ? updatedTitle : video.title || video.id
      }
      breadcrumbEllipsis
      accessory={
        <div className="flex gap-2">
          {hasAiTextGeneration && (
            <AiButton {...{ aiContent, shouldConfirm: hasTextContent }} />
          )}
          <ExifSyncButton videoUrl={video.url} onSync={setUpdatedExifData} />
        </div>
      }
      isLoading={pending}
    >
      <VideoForm
        type="edit"
        initialVideoForm={videoForm}
        updatedExifData={updatedExifData}
        updatedBlurData={blurData}
        uniqueTags={uniqueTags}
        aiContent={hasAiTextGeneration ? aiContent : undefined}
        onTitleChange={setUpdatedTitle}
        onTextContentChange={setHasTextContent}
        onFormStatusChange={setIsPending}
      />
    </AdminChildPage>
  );
}
