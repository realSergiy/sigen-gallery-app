import { altTextForVideo, doesVideoNeedBlurCompatibility, VideoSetAttributes } from '.';
import ImageSmall from '@/components/image/ImageSmall';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import { pathForVideo } from '@/site/paths';
import { SHOULD_PREFETCH_ALL_LINKS } from '@/site/config';
import { useRef } from 'react';
import useOnVisible from '@/utility/useOnVisible';
import { Video } from '@/db/video_orm';

export default function VideoSmall({
  video,
  tag,
  selected,
  className,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  onVisible,
}: {
  video: Video;
  selected?: boolean;
  className?: string;
  prefetch?: boolean;
  onVisible?: () => void;
} & VideoSetAttributes) {
  const ref = useRef<HTMLAnchorElement>(null);

  useOnVisible(ref, onVisible);

  // ToDo: aspect ratio field may be needed

  return (
    <Link
      ref={ref}
      href={pathForVideo({ video, tag })}
      className={clsx(
        className,
        'active:brightness-75',
        selected && 'brightness-50',
        'min-w-[50px]',
        'overflow-hidden rounded-[3px]',
        'border-subtle',
      )}
      prefetch={prefetch}
    >
      <ImageSmall
        src={video.url}
        aspectRatio={16 / 9}
        blurCompatibilityMode={doesVideoNeedBlurCompatibility(video)}
        alt={altTextForVideo(video)}
      />
    </Link>
  );
}
