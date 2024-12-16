'use client';

import {
  Video,
  VideoSetAttributes,
  altTextForVideo,
  doesVideoNeedBlurCompatibility,
} from '.';
import ImageMedium from '@/components/image/ImageMedium';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import { pathForVideo } from '@/site/paths';
import { SHOULD_PREFETCH_ALL_LINKS } from '@/site/config';
import { useRef } from 'react';
import useOnVisible from '@/utility/useOnVisible';

export default function VideoMedium({
  video,
  tag,
  camera,
  simulation,
  focal,
  selected,
  priority,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  className,
  onVisible,
}: {
  video: Video;
  selected?: boolean;
  priority?: boolean;
  prefetch?: boolean;
  className?: string;
  onVisible?: () => void;
} & VideoSetAttributes) {
  const ref = useRef<HTMLAnchorElement>(null);

  useOnVisible(ref, onVisible);

  return (
    <Link
      ref={ref}
      href={pathForVideo({ video, tag, camera, simulation, focal })}
      className={clsx(
        'active:brightness-75',
        selected && 'brightness-50',
        className,
      )}
      prefetch={prefetch}
    >
      <ImageMedium
        src={video.url}
        aspectRatio={video.aspectRatio}
        blurDataURL={video.blurData}
        blurCompatibilityMode={doesVideoNeedBlurCompatibility(video)}
        className="flex object-cover w-full h-full"
        imgClassName="object-cover w-full h-full"
        alt={altTextForVideo(video)}
        priority={priority}
      />
    </Link>
  );
}
