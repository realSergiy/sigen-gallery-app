import { Video } from '@/db/video_orm';
import { INFINITE_SCROLL_FEED_INITIAL, INFINITE_SCROLL_FEED_MULTIPLE } from '.';
import VideosLarge from './VideosLarge';
import VideosLargeInfinite from './VideosLargeInfinite';

export default function VideoFeedPage({
  videos,
  videosCount,
}: {
  videos: Video[];
  videosCount: number;
}) {
  return (
    <div className="space-y-1">
      <VideosLarge {...{ videos }} />
      {videosCount > videos.length && (
        <VideosLargeInfinite
          initialOffset={INFINITE_SCROLL_FEED_INITIAL}
          itemsPerPage={INFINITE_SCROLL_FEED_MULTIPLE}
        />
      )}
    </div>
  );
}
