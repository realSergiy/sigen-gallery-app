'use client';

import {
  Video,
  altTextForVideo,
  doesVideoNeedBlurCompatibility,
  titleForVideo,
} from '.';
import SiteGrid from '@/components/SiteGrid';
import ImageLarge from '@/components/image/ImageLarge';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import {
  pathForFocalLength,
  pathForVideo,
  pathForVideoShare,
} from '@/site/paths';
import VideoTags from '@/tag/VideoTags';
import ShareButton from '@/components/ShareButton';
import DownloadButton from '@/components/DownloadButton';
import { cameraFromVideo } from '@/camera';
import VideoFilmSimulation from '@/simulation/VideoFilmSimulation';
import { sortTags } from '@/tag';
import DivDebugBaselineGrid from '@/components/DivDebugBaselineGrid';
import VideoLink from './VideoLink';
import {
  SHOULD_PREFETCH_ALL_LINKS,
  ALLOW_PUBLIC_DOWNLOADS,
} from '@/site/config';
import AdminVideoMenuClient from '@/admin/AdminVideoMenuClient';
import { RevalidateVideo } from './InfiniteVideoScroll';
import { useRef } from 'react';
import useOnVisible from '@/utility/useOnVisible';
import VideoDate from './VideoDate';
import { useAppState } from '@/state/AppState';

export default function VideoLarge({
  video,
  className,
  primaryTag,
  priority,
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
}: {
  video: Video;
  className?: string;
  primaryTag?: string;
  priority?: boolean;
  prefetch?: boolean;
  prefetchRelatedLinks?: boolean;
  revalidateVideo?: RevalidateVideo;
  showTitle?: boolean;
  showTitleAsH1?: boolean;
  shouldShare?: boolean;
  shouldShareTag?: boolean;
  shouldScrollOnShare?: boolean;
  includeFavoriteInAdminMenu?: boolean;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const tags = sortTags(video.tags, primaryTag);

  const camera = cameraFromVideo(video);

  const showTagsContent = tags.length > 0;

  useOnVisible(ref, onVisible);

  const { areVideosMatted, isUserSignedIn } = useAppState();

  const hasTitle = showTitle && Boolean(video.title);

  const hasTitleContent = hasTitle || Boolean(video.caption);

  const hasMetaContent = showTagsContent;

  const hasNonDateContent = hasTitleContent || hasMetaContent;

  const renderVideoLink = () => (
    <VideoLink
      video={video}
      className="flex-grow font-bold uppercase"
      prefetch={prefetch}
    />
  );

  return (
    <SiteGrid
      containerRef={ref}
      className={className}
      contentMain={
        <Link
          href={pathForVideo({ video })}
          className={clsx(
            areVideosMatted && 'flex aspect-[3/2] items-center bg-gray-100',
          )}
          prefetch={prefetch}
        >
          <div
            className={clsx(
              areVideosMatted && 'flex w-full items-center justify-center',
              areVideosMatted && video.aspectRatio >= 1 ? 'h-[80%]' : 'h-[90%]',
            )}
          >
            <VideoLarge
              className={clsx(areVideosMatted && 'h-full')}
              imgClassName={clsx(
                areVideosMatted && 'object-contain w-full h-full',
              )}
              alt={altTextForVideo(video)}
              src={video.url}
              aspectRatio={video.aspectRatio}
              blurDataURL={video.blurData}
              blurCompatibilityMode={doesVideoNeedBlurCompatibility(video)}
              priority={priority}
            />
          </div>
        </Link>
      }
      contentSide={
        <DivDebugBaselineGrid
          className={clsx(
            'relative',
            'sticky top-4 -translate-y-1 self-start',
            'grid grid-cols-2 md:grid-cols-1',
            'gap-y-baseline gap-x-0.5 sm:gap-x-1',
            'pb-6',
          )}
        >
          {/* Meta */}
          <div className="pr-2 md:pr-0">
            <div className="flex items-start gap-2 md:relative">
              {hasTitle &&
                (showTitleAsH1 ? (
                  <h1>{renderVideoLink()}</h1>
                ) : (
                  renderVideoLink()
                ))}
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
              {(showCameraContent || showTagsContent) && (
                <div>
                  {showTagsContent && (
                    <VideoTags
                      tags={tags}
                      contrast="medium"
                      prefetch={prefetchRelatedLinks}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {/* EXIF Data */}
          <div
            className={clsx(
              'space-y-baseline',
              !hasTitleContent && 'md:-mt-baseline',
            )}
          >
            {showExifContent && (
              <>
                <ul className="text-medium">
                  <li>
                    {video.focalLength && (
                      <Link
                        href={pathForFocalLength(video.focalLength)}
                        className="hover:text-main active:text-medium"
                      >
                        {video.focalLengthFormatted}
                      </Link>
                    )}
                    {video.focalLengthIn35MmFormatFormatted && (
                      <>
                        {' '}
                        <span
                          title="35mm equivalent"
                          className="text-extra-dim"
                        >
                          {video.focalLengthIn35MmFormatFormatted}
                        </span>
                      </>
                    )}
                  </li>
                  <li>{video.fNumberFormatted}</li>
                  <li>{video.exposureTimeFormatted}</li>
                  <li>{video.isoFormatted}</li>
                  <li>{video.exposureCompensationFormatted ?? '0ev'}</li>
                </ul>
                {showSimulation && video.filmSimulation && (
                  <VideoFilmSimulation
                    simulation={video.filmSimulation}
                    prefetch={prefetchRelatedLinks}
                  />
                )}
              </>
            )}
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
                  ALLOW_PUBLIC_DOWNLOADS
                    ? 'translate-x-[-2.5px]'
                    : 'md:translate-x-[-2.5px]',
                )}
              >
                {shouldShare && (
                  <ShareButton
                    path={pathForVideoShare({
                      video,
                      tag: shouldShareTag ? primaryTag : undefined,
                      camera: shouldShareCamera ? camera : undefined,
                      // eslint-disable-next-line max-len
                      simulation: shouldShareSimulation
                        ? video.filmSimulation
                        : undefined,
                      // eslint-disable-next-line max-len
                      focal: shouldShareFocalLength
                        ? video.focalLength
                        : undefined,
                    })}
                    prefetch={prefetchRelatedLinks}
                    shouldScroll={shouldScrollOnShare}
                  />
                )}
                {ALLOW_PUBLIC_DOWNLOADS && (
                  <DownloadButton
                    className={clsx('translate-y-[0.5px] md:translate-y-0')}
                    video={video}
                  />
                )}
              </div>
            </div>
          </div>
        </DivDebugBaselineGrid>
      }
    />
  );
}
