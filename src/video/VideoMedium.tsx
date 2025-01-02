'use client';

import { VideoSetAttributes, altTextForVideo, doesVideoNeedBlurCompatibility } from '.';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import { pathForVideo } from '@/site/paths';
import { SHOULD_PREFETCH_ALL_LINKS } from '@/site/config';
import { useRef } from 'react';
import useOnVisible from '@/utility/useOnVisible';
import { Video } from '@/db/video_orm';
import VidMedium from '@/components/video/VidMedium';

export default function VideoMedium({
  video,
  tag,
  selected,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  className,
  onVisible,
}: {
  video: Video;
  selected?: boolean;
  prefetch?: boolean;
  className?: string;
  onVisible?: () => void;
} & VideoSetAttributes) {
  const ref = useRef<HTMLAnchorElement>(null);

  useOnVisible(ref, onVisible);

  // ToDo: aspect ratio field may be needed

  return (
    <Link
      ref={ref}
      href={pathForVideo({ video, tag })}
      className={clsx('active:brightness-75', selected && 'brightness-50', className)}
      prefetch={prefetch}
    >
      <VidMedium
        src={video.url}
        aspectRatio={16 / 9}
        blurCompatibilityMode={doesVideoNeedBlurCompatibility(video)}
        className="flex h-full w-full object-cover"
        videoClassName="object-cover w-full h-full"
        alt={altTextForVideo(video)}
      />
    </Link>
  );
}
