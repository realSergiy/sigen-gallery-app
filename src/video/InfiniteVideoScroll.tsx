'use client';

import useSwrInfinite from 'swr/infinite';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import SiteGrid from '@/components/SiteGrid';
import Spinner from '@/components/Spinner';
import { clsx } from 'clsx/lite';
import { useAppState } from '@/state/AppState';

export type RevalidateVideo = (
  videoId: string,
  revalidateRemainingVideos?: boolean,
) => Promise<any>;

export default function InfiniteVideoScroll({
  cacheKey,
  initialOffset,
  itemsPerPage,
  sortBy,
  tag,
  camera,
  simulation,
  wrapMoreButtonInGrid,
  useCachedPhotos = true,
  includeHiddenPhotos,
  children,
}: {
  initialOffset: number;
  itemsPerPage: number;
  sortBy?: GetPhotosOptions['sortBy'];
  cacheKey: string;
  wrapMoreButtonInGrid?: boolean;
  useCachedPhotos?: boolean;
  includeHiddenPhotos?: boolean;
  children: (props: {
    videos: Photo[];
    onLastPhotoVisible: () => void;
    revalidatePhoto?: RevalidatePhoto;
  }) => ReactNode;
} & PhotoSetAttributes) {
  const { swrTimestamp, isUserSignedIn } = useAppState();

  const key = `${swrTimestamp}-${cacheKey}`;

  const keyGenerator = useCallback(
    (size: number, prev: Photo[]) =>
      prev && prev.length === 0 ? null : [key, size],
    [key],
  );

  const fetcher = useCallback(
    ([_key, size]: [string, number]) =>
      (useCachedPhotos ? getPhotosCachedAction : getPhotosAction)({
        offset: initialOffset + size * itemsPerPage,
        sortBy,
        limit: itemsPerPage,
        hidden: includeHiddenPhotos ? 'include' : 'exclude',
        tag,
        camera,
        simulation,
      }),
    [
      useCachedPhotos,
      sortBy,
      initialOffset,
      itemsPerPage,
      includeHiddenPhotos,
      tag,
      camera,
      simulation,
    ],
  );

  const { data, isLoading, isValidating, error, mutate, setSize } =
    useSwrInfinite<Photo[]>(keyGenerator, fetcher, {
      initialSize: 2,
      revalidateFirstPage: false,
      revalidateOnFocus: Boolean(isUserSignedIn),
      revalidateOnReconnect: Boolean(isUserSignedIn),
    });

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

  const revalidatePhoto: RevalidatePhoto = useCallback(
    (videoId: string, revalidateRemainingPhotos?: boolean) =>
      mutate(data, {
        revalidate: (_data: Photo[], [_, size]: [string, number]) => {
          const i = (data ?? []).findIndex(videos =>
            videos.some(video => video.id === videoId),
          );
          return revalidateRemainingPhotos ? size >= i : size === i;
        },
      } as any),
    [data, mutate],
  );

  const renderMoreButton = () => (
    <div ref={buttonContainerRef}>
      <button
        onClick={() => (error ? mutate() : advance())}
        disabled={isLoading || isValidating}
        className={clsx(
          'flex w-full justify-center',
          isLoadingOrValidating && 'subtle',
        )}
      >
        {error ? (
          'Try Again'
        ) : isLoadingOrValidating ? (
          <Spinner size={20} />
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {children({
        videos,
        onLastPhotoVisible: advance,
        revalidatePhoto,
      })}
      {!isFinished &&
        (wrapMoreButtonInGrid ? (
          <SiteGrid contentMain={renderMoreButton()} />
        ) : (
          renderMoreButton()
        ))}
    </div>
  );
}
