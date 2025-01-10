import { Video } from '@/db/video_orm';
import { INFINITE_SCROLL_FEED_INITIAL, INFINITE_SCROLL_FEED_MULTIPLE } from '.';
import VideosLarge from './VideosLarge';
import VideosLargeInfinite from './VideosLargeInfinite';
import { TestIdProps } from '@/components/types';

type VideoFeedPageProps = {
  videos: Video[];
  videosCount: number;
} & TestIdProps;

export default function VideoFeedPage({
  videos,
  videosCount,
  'data-testid': dataTestId,
}: VideoFeedPageProps) {
  return (
    <div data-testid={dataTestId} className="space-y-1">
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
