import { descriptionForTaggedVideos, isTagFavs } from '.';
import { pathForTagShare } from '@/site/paths';
import FavsTag from './FavsTag';
import { VideoDateRange } from '@/video';
import { Video } from '@/db/video_orm';
import EntityLinkTag from './EntityLinkTag';
import VideoHeader from '@/video/VideoHeader';

export default function TagHeader({
  tag,
  videos,
  selectedVideo,
  indexNumber,
  count,
  dateRange,
}: {
  tag: string;
  videos: Video[];
  selectedVideo?: Video;
  indexNumber?: number;
  count?: number;
  dateRange?: VideoDateRange;
}) {
  return (
    <VideoHeader
      tag={tag}
      entity={
        isTagFavs(tag) ? <FavsTag contrast="high" /> : <EntityLinkTag tag={tag} contrast="high" />
      }
      entityVerb="Tagged"
      entityDescription={descriptionForTaggedVideos(videos, undefined, count)}
      videos={videos}
      selectedVideo={selectedVideo}
      sharePath={pathForTagShare(tag)}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />
  );
}
