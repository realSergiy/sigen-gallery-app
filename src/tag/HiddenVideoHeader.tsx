import HiddenTag from './HiddenTag';
import VideoHeader from '@/video/VideoHeader';
import { Video } from '@/db/video_orm';
import { videoQuantityText } from '@/video';

export default function HiddenHeader({
  videos,
  selectedVideo,
  indexNumber,
  count,
}: {
  videos: Video[];
  selectedVideo?: Video;
  indexNumber?: number;
  count: number;
}) {
  return (
    <VideoHeader
      key="HiddenHeader"
      entity={<HiddenTag contrast="high" />}
      entityDescription={videoQuantityText(count, false)}
      videos={videos}
      selectedVideo={selectedVideo}
      indexNumber={indexNumber}
      count={count}
    />
  );
}
