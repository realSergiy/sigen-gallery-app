import { getVideoCached } from '@/video/cache';
import VideoShareModal from '@/video/VideoShareModal';
import { PATH_ROOT } from '@/site/paths';
import { redirect } from 'next/navigation';

export default async function Share(props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;

  const { videoId } = params;

  const video = await getVideoCached(videoId);

  if (!video) {
    return redirect(PATH_ROOT);
  }

  return <VideoShareModal video={video} />;
}
