import { clsx } from 'clsx/lite';
import { Video } from '.';
import VideoGrid from './VideoGrid';
import Link from 'next/link';

export default function VideoLightbox({
  count,
  videos,
  maxVideosToShow = 6,
  moreLink,
}: {
  count: number;
  videos: Video[];
  maxVideosToShow?: number;
  moreLink: string;
}) {
  const videoCountToShow =
    maxVideosToShow < count ? maxVideosToShow - 1 : maxVideosToShow;

  const countNotShown = count - videoCountToShow;

  const showOverageTile = countNotShown > 0;

  return (
    <div
      className={clsx(
        'rounded-md border p-1.5 dark:border-gray-800 lg:p-2',
        'bg-gray-50 dark:bg-gray-950',
      )}
    >
      <VideoGrid
        videos={videos.slice(0, videoCountToShow)}
        animate={false}
        additionalTile={
          showOverageTile ? (
            <Link
              href={moreLink}
              className={clsx(
                'flex flex-col items-center justify-center',
                'gap-0.5 lg:gap-1',
              )}
            >
              <div className="text-[1.1rem] lg:text-[1.5rem]">
                +{countNotShown}
              </div>
              <div className="text-dim">More</div>
            </Link>
          ) : undefined
        }
        small
      />
    </div>
  );
}
