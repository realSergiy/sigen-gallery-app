'use client';

import AdminChildPage from '@/components/AdminChildPage';
import { PATH_ADMIN_PHOTO_UPLOADS } from '@/site/paths';
import type { VideoFormData } from './form';
import VideoForm from './form/VideoForm';
import type { Tags } from '@/tag';
import useVideoFormParent from './form/useVideoFormParent';
import { useMemo } from 'react';
import { formatDate } from '@/utility/date';

type UpdatePageClientProps = {
  blobId?: string;
  videoFormData: Partial<VideoFormData>;
  uniqueTags: Tags;
};

export default function UploadPageClient({
  blobId,
  videoFormData,
  uniqueTags,
}: UpdatePageClientProps) {
  const { pending, setIsPending, updatedTitle, setUpdatedTitle, setHasTextContent } =
    useVideoFormParent({});

  const initialVideoForm = useMemo(
    () => ({
      ...videoFormData,
      videoUrl: videoFormData.videoUrl,
      takenAt: videoFormData.takenAt ?? formatDate(new Date()),
    }),
    [videoFormData],
  );

  return (
    <AdminChildPage
      backPath={PATH_ADMIN_PHOTO_UPLOADS}
      backLabel="Uploads"
      breadcrumb={pending && updatedTitle ? updatedTitle : blobId}
      breadcrumbEllipsis
      isLoading={pending}
    >
      <VideoForm
        initialVideoForm={initialVideoForm}
        uniqueTags={uniqueTags}
        onTitleChange={setUpdatedTitle}
        onTextContentChange={setHasTextContent}
        onFormStatusChange={setIsPending}
      />
    </AdminChildPage>
  );
}
