'use client';

import AdminChildPage from '@/components/AdminChildPage';
import { PATH_ADMIN_VIDEOS } from '@/site/paths';
import { convertVideoToFormData } from './form';
import VideoForm from './form/VideoForm';
import { Tags } from '@/tag';
import useVideoFormParent from './form/useVideoFormParent';
import { Video } from '@/db/video_orm';
import VideoSyncButton from '@/admin/VideoSyncButton';

export default function VideoEditPageClient({
  video,
  uniqueTags,
}: {
  video: Video;
  uniqueTags: Tags;
}) {
  const videoForm = convertVideoToFormData(video);

  const {
    pending,
    setIsPending,
    updatedTitle,
    setUpdatedTitle,
    hasTextContent,
    setHasTextContent,
  } = useVideoFormParent({
    videoForm,
  });

  return (
    <AdminChildPage
      backPath={PATH_ADMIN_VIDEOS}
      backLabel="Videos"
      breadcrumb={pending && updatedTitle ? updatedTitle : video.title || video.id}
      breadcrumbEllipsis
      accessory={
        <div className="flex gap-2">
          <VideoSyncButton videoId={video.id} videoTitle={video.title} />
        </div>
      }
      isLoading={pending}
    >
      <VideoForm
        type="edit"
        initialVideoForm={videoForm}
        uniqueTags={uniqueTags}
        onTitleChange={setUpdatedTitle}
        onTextContentChange={setHasTextContent}
        onFormStatusChange={setIsPending}
      />
    </AdminChildPage>
  );
}
