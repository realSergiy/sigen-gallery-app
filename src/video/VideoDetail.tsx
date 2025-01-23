'use client';

import { titleForVideo } from '.';
import SiteGrid from '@/components/SiteGrid';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { pathForVideo, pathForVideoShare } from '@/site/paths';
import ShareButton from '@/components/ShareButton';
import DownloadButton from '@/components/DownloadButton';
import { sortTags } from '@/tag';
import DivDebugBaselineGrid from '@/components/DivDebugBaselineGrid';
import VideoLink from './VideoLink';
import { SHOULD_PREFETCH_ALL_LINKS, ALLOW_PUBLIC_DOWNLOADS } from '@/site/config';
import AdminVideoMenuClient from '@/admin/AdminVideoMenuClient';
import { useRef } from 'react';
import useOnVisible from '@/utility/useOnVisible';
import VideoDate from './VideoDate';
import { useAppState } from '@/state/AppState';
import { Video } from '@/db/video_orm';
import MediaTags from '@/tag/MediaTags';
import { RevalidateMedia } from '@/media';
import { VIDEO_WIDTH_LARGE } from '@/components/video';
import VideoWithMasks from '@/components/video/VideoWithMasks';
import MasksSwitch from './MasksSwitch';

type VideoDetailProps = {
  video: Video;
  className?: string;
  primaryTag?: string;
  prefetch?: boolean;
  prefetchRelatedLinks?: boolean;
  revalidateVideo?: RevalidateMedia;
  showTitle?: boolean;
  showTitleAsH1?: boolean;
  shouldShare?: boolean;
  shouldShareTag?: boolean;
  shouldScrollOnShare?: boolean;
  includeFavoriteInAdminMenu?: boolean;
  onVisible?: () => void;
};

export default function VideoDetail({
  video,
  className,
  primaryTag,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  prefetchRelatedLinks = SHOULD_PREFETCH_ALL_LINKS,
  revalidateVideo,
  showTitle = true,
  showTitleAsH1,
  shouldShare = true,
  shouldShareTag,
  shouldScrollOnShare,
  includeFavoriteInAdminMenu,
  onVisible,
}: VideoDetailProps) {
  const ref = useRef<HTMLDivElement>(null);

  const tags = sortTags(video.tags, primaryTag);

  const showTagsContent = tags.length > 0;

  useOnVisible(ref, onVisible);

  const { areVideosMatted, isUserSignedIn } = useAppState();

  const hasTitle = showTitle && Boolean(video.title);

  const hasTitleContent = hasTitle || Boolean(video.caption);

  const hasMetaContent = showTagsContent;

  const hasNonDateContent = hasTitleContent || hasMetaContent;

  const renderVideoLink = () => (
    <VideoLink video={video} className="grow font-bold uppercase" prefetch={prefetch} />
  );

  // ToDo: aspectRatio may be needed, compore with PhotoLarge.tsx

  const aspectRatio = 16 / 9;

  const masks = video.videoMask ?? [];
  masks.push({ name: 'Original', videoUrl: video.videoUrl, bitmask: 0 });

  return (
    <SiteGrid
      containerRef={ref}
      className={className}
      contentMain={
        <Link
          href={pathForVideo({ video })}
          className={clsx(areVideosMatted && 'flex aspect-[3/2] items-center bg-gray-100')}
          prefetch={prefetch}
        >
          <div
            className={clsx(
              areVideosMatted && 'flex h-full items-center justify-center',
              areVideosMatted ? 'h-4/5' : 'h-[90%]',
            )}
          >
            <VideoWithMasks
              masks={[]}
              enabledBit={0}
              videoUrl={video.videoUrl}
              width={VIDEO_WIDTH_LARGE}
              height={Math.round(VIDEO_WIDTH_LARGE / aspectRatio)}
            />
          </div>
        </Link>
      }
      contentSide={
        <DivDebugBaselineGrid
          className={clsx(
            'gap-y-baseline sticky top-4 grid h-full',
            '-translate-y-1 grid-cols-2 gap-x-0.5',
            'sm:gap-x-1 md:grid-cols-1',
          )}
        >
          {/* Meta */}
          <div className="pr-2 md:pr-0">
            <div className="flex items-start gap-2 md:relative">
              {hasTitle && (showTitleAsH1 ? <h1>{renderVideoLink()}</h1> : renderVideoLink())}
              <div className="absolute right-0 z-10 translate-y-[-4px]">
                <AdminVideoMenuClient
                  {...{
                    video,
                    revalidateVideo,
                    includeFavorite: includeFavoriteInAdminMenu,
                    ariaLabel: `Admin menu for '${titleForVideo(video)}' video`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-baseline">
              {video.caption && (
                <div
                  className={clsx(
                    'uppercase',
                    // Prevent collision with admin button
                    isUserSignedIn && 'md:pr-7',
                  )}
                >
                  {video.caption}
                </div>
              )}
              {showTagsContent && (
                <div>
                  {showTagsContent && (
                    <MediaTags tags={tags} contrast="medium" prefetch={prefetchRelatedLinks} />
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Date */}
          <div
            className={clsx(
              'space-y-baseline flex flex-col justify-between',
              !hasTitleContent && 'md:-mt-baseline',
            )}
          >
            <div
              className={clsx(
                'gap-y-baseline flex gap-x-2.5',
                ALLOW_PUBLIC_DOWNLOADS ? 'flex-col' : 'md:flex-col',
                'md:justify-normal',
              )}
            >
              <VideoDate
                video={video}
                className={clsx(
                  'text-medium',
                  // Prevent collision with admin button
                  !hasNonDateContent && isUserSignedIn && 'md:pr-7',
                )}
              />
              <div
                className={clsx(
                  'flex translate-y-[0.5px] gap-1',
                  ALLOW_PUBLIC_DOWNLOADS ? 'translate-x-[-2.5px]' : 'md:translate-x-[-2.5px]',
                )}
              >
                {shouldShare && (
                  <ShareButton
                    path={pathForVideoShare({
                      video,
                      tag: shouldShareTag ? primaryTag : undefined,
                    })}
                    prefetch={prefetchRelatedLinks}
                    shouldScroll={shouldScrollOnShare}
                  />
                )}
                {ALLOW_PUBLIC_DOWNLOADS && (
                  <DownloadButton
                    className={clsx('translate-y-[0.5px] md:translate-y-0')}
                    media={video}
                  />
                )}
              </div>
            </div>
            <MasksSwitch
              tags={['mask A', 'mask B', 'mask C']}
              contrast="medium"
              prefetch={prefetchRelatedLinks}
              className={'pb-14 text-xl'}
            />
          </div>
        </DivDebugBaselineGrid>
      }
    />
  );
}
