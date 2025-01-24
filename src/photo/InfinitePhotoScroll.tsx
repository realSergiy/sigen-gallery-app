'use client';

import useSwrInfinite from 'swr/infinite';
import { ReactNode, useCallback, useMemo, useRef } from 'react';
import SiteGrid from '@/components/SiteGrid';
import Spinner from '@/components/Spinner';
import { getPhotosCachedAction, getPhotosAction } from '@/photo/serverFunctions';
import { Photo, PhotoSetAttributes } from '.';
import { clsx } from 'clsx/lite';
import { useAppState } from '@/state/AppState';
import { GetPhotosOptions } from './db';
import { RevalidateMedia } from '@/media';

type InfiniteScrollProps = {
  initialOffset: number;
  itemsPerPage: number;
  sortBy?: GetPhotosOptions['sortBy'];
  cacheKey: string;
  wrapMoreButtonInGrid?: boolean;
  useCached?: boolean;
  includeHidden?: boolean;
  children: (props: {
    items: Photo[];
    onLastItemVisible: () => void;
    revalidateItem?: RevalidateMedia;
  }) => ReactNode;
} & PhotoSetAttributes;

export default function InfinitePhotoScroll({
  cacheKey,
  initialOffset,
  itemsPerPage,
  sortBy,
  tag,
  camera,
  simulation,
  wrapMoreButtonInGrid,
  useCached = true,
  includeHidden,
  children,
}: InfiniteScrollProps) {
  const { swrTimestamp, isUserSignedIn } = useAppState();

  const key = `${swrTimestamp}-${cacheKey}`;

  const keyGenerator = useCallback(
    (size: number, previous: []) => (previous && previous.length === 0 ? null : [key, size]),
    [key],
  );

  const fetcher = useCallback(
    ([, size]: [string, number]) =>
      (useCached ? getPhotosCachedAction : getPhotosAction)({
        offset: initialOffset + size * itemsPerPage,
        sortBy,
        limit: itemsPerPage,
        hidden: includeHidden ? 'include' : 'exclude',
        tag,
        camera,
        simulation,
      }),
    [useCached, sortBy, initialOffset, itemsPerPage, includeHidden, tag, camera, simulation],
  );

  const { data, isLoading, isValidating, error, mutate, setSize } = useSwrInfinite<Photo[]>(
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
    () => (data?.at(-1)?.length ?? 0) < itemsPerPage,
    [data, itemsPerPage],
  );

  const advance = useCallback(() => {
    if (!isFinished && !isLoadingOrValidating) {
      setSize(size => size + 1);
    }
  }, [isFinished, isLoadingOrValidating, setSize]);

  const items = useMemo(() => (data ?? [])?.flat(), [data]);

  const revalidate: RevalidateMedia = useCallback(
    (id: string, revalidateRemaining?: boolean) =>
      mutate(data, {
        revalidate: (_data, key) => {
          if (Array.isArray(key) && key.length >= 2 && typeof key[1] === 'number') {
            const size = key[1];
            const index = (data ?? []).findIndex(items => items.some(item => item.id === id));
            return revalidateRemaining ? size >= index : size === index;
          }
          return false;
        },
      }),
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
        items,
        onLastItemVisible: advance,
        revalidateItem: revalidate,
      })}
      {!isFinished &&
        (wrapMoreButtonInGrid ? <SiteGrid contentMain={renderMoreButton()} /> : renderMoreButton())}
    </div>
  );
}
