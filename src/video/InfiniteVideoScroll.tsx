'use client';

import useSwrInfinite from 'swr/infinite';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import SiteGrid from '@/components/SiteGrid';
import Spinner from '@/components/Spinner';
import { clsx } from 'clsx/lite';
import { useAppState } from '@/state/AppState';
import { Video, VideoQueryOptions } from '@/db/video_orm';
import { VideoSetAttributes } from '.';
import { getVideosAction, getVideosCachedAction } from './actions';

export type RevalidateVideo = (
  videoId: string,
  revalidateRemainingVideos?: boolean,
) => Promise<any>;

export default function InfiniteVideoScroll({
  cacheKey,
  initialOffset,
  itemsPerPage,
  sort,
  tag,
  wrapMoreButtonInGrid,
  useCachedVideos = true,
  includeHiddenVideos,
  children,
}: {
  initialOffset: number;
  itemsPerPage: number;
  sort?: VideoQueryOptions['sort'];
  cacheKey: string;
  wrapMoreButtonInGrid?: boolean;
  useCachedVideos?: boolean;
  includeHiddenVideos?: boolean;
  children: (props: {
    videos: Video[];
    onLastVideoVisible: () => void;
    revalidateVideo?: RevalidateVideo;
  }) => ReactNode;
} & VideoSetAttributes) {
  const { swrTimestamp, isUserSignedIn } = useAppState();

  const key = `${swrTimestamp}-${cacheKey}`;

  const keyGenerator = useCallback(
    (size: number, prev: Video[]) => (prev && prev.length === 0 ? null : [key, size]),
    [key],
  );

  const fetcher = useCallback(
    ([_key, size]: [string, number]) =>
      (useCachedVideos ? getVideosCachedAction : getVideosAction)({
        offset: initialOffset + size * itemsPerPage,
        sort,
        limit: itemsPerPage,
        hidden: includeHiddenVideos ? 'include' : 'exclude',
        filter: undefined, //add tag filter here
      }),
    [useCachedVideos, sort, initialOffset, itemsPerPage, includeHiddenVideos],
  );

  const { data, isLoading, isValidating, error, mutate, setSize } = useSwrInfinite<Video[]>(
    keyGenerator,
    fetcher,
    {
      initialSize: 2,
      revalidateFirstPage: false,
      revalidateOnFocus: Boolean(isUserSignedIn),
      revalidateOnReconnect: Boolean(isUserSignedIn),
    },
  );

  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const isLoadingOrValidating = isLoading || isValidating;

  const isFinished = useMemo(
    () => data && data[data.length - 1]?.length < itemsPerPage,
    [data, itemsPerPage],
  );

  const advance = useCallback(() => {
    if (!isFinished && !isLoadingOrValidating) {
      setSize(size => size + 1);
    }
  }, [isFinished, isLoadingOrValidating, setSize]);

  const videos = useMemo(() => (data ?? [])?.flat(), [data]);

  const revalidateVideo: RevalidateVideo = useCallback(
    (videoId: string, revalidateRemainingVideos?: boolean) =>
      mutate(data, {
        revalidate: (_data: Video[], [_, size]: [string, number]) => {
          const i = (data ?? []).findIndex(videos => videos.some(video => video.id === videoId));
          return revalidateRemainingVideos ? size >= i : size === i;
        },
      } as any),
    [data, mutate],
  );

  const renderMoreButton = () => (
    <div ref={buttonContainerRef}>
      <button
        onClick={() => (error ? mutate() : advance())}
        disabled={isLoading || isValidating}
        className={clsx('flex w-full justify-center', isLoadingOrValidating && 'subtle')}
      >
        {error ? 'Try Again' : isLoadingOrValidating ? <Spinner size={20} /> : 'Load More'}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {children({
        videos,
        onLastVideoVisible: advance,
        revalidateVideo,
      })}
      {!isFinished &&
        (wrapMoreButtonInGrid ? <SiteGrid contentMain={renderMoreButton()} /> : renderMoreButton())}
    </div>
  );
}