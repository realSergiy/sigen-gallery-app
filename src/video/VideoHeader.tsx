'use client';

import { clsx } from 'clsx/lite';
import { Video, VideoDateRange, VideoSetAttributes, dateRangeForVideos, titleForVideo } from '.';
import ShareButton from '@/components/ShareButton';
import AnimateItems from '@/components/AnimateItems';
import { ReactNode } from 'react';
import DivDebugBaselineGrid from '@/components/DivDebugBaselineGrid';
import VideoPrevNext from './VideoPrevNext';
import VideoLink from './VideoLink';
import ResponsiveText from '@/components/primitives/ResponsiveText';
import { useAppState } from '@/state/AppState';

export default function VideoHeader({
  tag,
  camera,
  simulation,
  focal,
  videos,
  selectedVideo,
  entity,
  entityVerb = 'PHOTO',
  entityDescription,
  sharePath,
  indexNumber,
  count,
  dateRange,
}: {
  videos: Video[];
  selectedVideo?: Video;
  entity?: ReactNode;
  entityVerb?: string;
  entityDescription?: string;
  sharePath?: string;
  indexNumber?: number;
  count?: number;
  dateRange?: VideoDateRange;
} & VideoSetAttributes) {
  const { isGridHighDensity } = useAppState();

  const { start, end } = dateRangeForVideos(videos, dateRange);

  const selectedVideoIndex = selectedVideo
    ? videos.findIndex(video => video.id === selectedVideo.id)
    : undefined;

  const paginationLabel =
    (indexNumber || (selectedVideoIndex ?? 0 + 1)) + ' of ' + (count ?? videos.length);

  const headerType =
    selectedVideoIndex === undefined
      ? 'video-set'
      : entity
        ? 'video-detail-with-entity'
        : 'video-detail';

  const renderPrevNext = () => (
    <VideoPrevNext
      {...{
        video: selectedVideo,
        videos,
        tag,
        camera,
        simulation,
        focal,
      }}
    />
  );

  const renderDateRange = () => (
    <span className="text-dim text-right uppercase">
      {start === end ? (
        start
      ) : (
        <>
          {end}
          <br />– {start}
        </>
      )}
    </span>
  );

  const renderContentA = () =>
    entity ??
    (selectedVideo !== undefined && (
      <VideoLink video={selectedVideo} className="truncate text-ellipsis font-bold uppercase">
        {titleForVideo(selectedVideo, true)}
      </VideoLink>
    ));

  return (
    <AnimateItems
      type="bottom"
      distanceOffset={10}
      animateOnFirstLoadOnly
      items={[
        <DivDebugBaselineGrid
          key="VideosHeader"
          className={clsx(
            'grid items-start gap-0.5 sm:gap-1',
            'grid-cols-4',
            isGridHighDensity ? 'lg:grid-cols-6' : 'md:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {/* Content A: Filter Set or Video Title */}
          <div
            className={clsx(
              'inline-flex uppercase',
              headerType === 'video-set'
                ? isGridHighDensity
                  ? 'col-span-2 sm:col-span-1 lg:col-span-2'
                  : 'col-span-2 sm:col-span-1'
                : headerType === 'video-detail-with-entity'
                  ? isGridHighDensity
                    ? 'col-span-2 sm:col-span-1 lg:col-span-2'
                    : 'col-span-2 sm:col-span-1'
                  : isGridHighDensity
                    ? 'col-span-3 sm:col-span-3 lg:col-span-5'
                    : 'col-span-3 md:col-span-2 lg:col-span-3',
            )}
          >
            {headerType === 'video-detail-with-entity' ? (
              renderContentA()
            ) : (
              <h1>{renderContentA()}</h1>
            )}
          </div>
          {/* Content B: Filter Set Meta or Video Pagination */}
          <div
            className={clsx(
              'inline-flex',
              'gap-2 self-start',
              'text-dim uppercase',
              headerType === 'video-set'
                ? isGridHighDensity
                  ? 'col-span-2 lg:col-span-3'
                  : 'col-span-2 md:col-span-1 lg:col-span-2'
                : headerType === 'video-detail-with-entity'
                  ? isGridHighDensity
                    ? 'sm:col-span-2 lg:col-span-3'
                    : 'sm:col-span-2 md:col-span-1 lg:col-span-2'
                  : 'hidden',
            )}
          >
            {entity && (
              <>
                {headerType === 'video-set' ? (
                  <>
                    {entityDescription}
                    {sharePath && (
                      <ShareButton className="translate-y-[1.5px]" path={sharePath} dim />
                    )}
                  </>
                ) : (
                  <ResponsiveText shortText={paginationLabel}>
                    {entityVerb} {paginationLabel}
                  </ResponsiveText>
                )}
              </>
            )}
          </div>
          {/* Content C: Nav */}
          <div
            className={clsx(headerType === 'video-set' ? 'hidden sm:flex' : 'flex', 'justify-end')}
          >
            {selectedVideo ? renderPrevNext() : renderDateRange()}
          </div>
        </DivDebugBaselineGrid>,
      ]}
    />
  );
}
