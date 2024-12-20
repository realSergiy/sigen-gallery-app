'use client';

import AdminChildPage from '@/components/AdminChildPage';
import { PATH_ADMIN_PHOTO_UPLOADS } from '@/site/paths';
import { VideoFormData, generateTakenAtFields } from './form';
import VideoForm from './form/VideoForm';
import { Tags } from '@/tag';
import useVideoFormParent from './form/useVideoFormParent';
import { useMemo } from 'react';
import { formatDate } from '@/utility/date';

export default function UploadPageClient({
  blobId,
  videoFormExif,
  uniqueTags,
}: {
  blobId?: string;
  videoFormExif: Partial<VideoFormData>;
  uniqueTags: Tags;
}) {
  const {
    pending,
    setIsPending,
    updatedTitle,
    setUpdatedTitle,
    hasTextContent,
    setHasTextContent,
  } = useVideoFormParent({});

  const initialVideoForm = useMemo(
    () => ({
      ...videoFormExif,
      takenAt: videoFormExif.takenAt ?? formatDate(new Date()),
    }),
    [videoFormExif],
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
