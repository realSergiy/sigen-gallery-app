'use client';

import SiteGrid from '@/components/SiteGrid';
import VideoGrid from './VideoGrid';
import VideoGridInfinite from './VideoGridInfinite';
import { clsx } from 'clsx/lite';
import AnimateItems from '@/components/AnimateItems';
import { ComponentProps, useCallback, useState, type JSX } from 'react';
import { TestIdProps } from '@/components/types';

export default function VideoGridContainer({
  cacheKey,
  videos,
  count,
  tag,
  animateOnFirstLoadOnly,
  header,
  sidebar,
  canSelect,
  'data-testid': dataTestId,
}: {
  cacheKey: string;
  count: number;
  header?: JSX.Element;
  sidebar?: JSX.Element;
} & ComponentProps<typeof VideoGrid> &
  TestIdProps) {
  const [shouldAnimateDynamicItems, setShouldAnimateDynamicItems] = useState(false);

  const onAnimationComplete = useCallback(() => setShouldAnimateDynamicItems(true), []);

  const initialOffset = videos.length;

  return (
    <SiteGrid
      contentMain={
        <div className={clsx(header && 'mt-1.5 space-y-8')} data-testid={dataTestId}>
          {header && <AnimateItems type="bottom" items={[header]} animateOnFirstLoadOnly />}
          <div className="space-y-0.5 sm:space-y-1">
            <VideoGrid
              {...{
                videos,
                tag,
                animateOnFirstLoadOnly,
                onAnimationComplete,
                canSelect,
              }}
            />
            {count > initialOffset && (
              <VideoGridInfinite
                {...{
                  cacheKey,
                  initialOffset,
                  canStart: shouldAnimateDynamicItems,
                  tag,
                  animateOnFirstLoadOnly,
                  canSelect,
                }}
              />
            )}
          </div>
        </div>
      }
      contentSide={sidebar}
      sideHiddenOnMobile
    />
  );
}
