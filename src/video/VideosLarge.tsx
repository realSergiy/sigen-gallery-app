import AnimateItems from '@/components/AnimateItems';
import VideoLarge from './VideoLarge';
import { RevalidateVideo } from './InfiniteVideoScroll';
import { Video } from '@/db/video_orm';

export default function VideosLarge({
  videos,
  animate = true,
  prefetchFirstVideoLinks,
  onLastVideoVisible,
  revalidateVideo,
}: {
  videos: Video[];
  animate?: boolean;
  prefetchFirstVideoLinks?: boolean;
  onLastVideoVisible?: () => void;
  revalidateVideo?: RevalidateVideo;
}) {
  return (
    <AnimateItems
      className="space-y-1"
      type={animate ? 'scale' : 'none'}
      duration={0.7}
      staggerDelay={0.15}
      distanceOffset={0}
      staggerOnFirstLoadOnly
      items={videos.map((video, index) => (
        <VideoLarge
          key={video.id}
          video={video}
          priority={index <= 1}
          prefetchRelatedLinks={prefetchFirstVideoLinks && index === 0}
          revalidateVideo={revalidateVideo}
          onVisible={
            index === videos.length - 1 ? onLastVideoVisible : undefined
          }
        />
      ))}
      itemKeys={videos.map(video => video.id)}
    />
  );
}
