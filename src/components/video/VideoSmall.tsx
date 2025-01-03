import React from 'react';

export default function VideoSmall({
  src,
  aspectRatio = 3 / 2,
  className,
}: {
  src: string;
  aspectRatio?: number;
  className?: string;
}) {
  const width = 160; // same as IMAGE_WIDTH_SMALL
  const height = Math.round(width / aspectRatio);

  return (
    <div
      style={{ width, height }}
      className={`border-subtle overflow-hidden rounded-[3px] ${className ?? ''}`}
    >
      <video
        src={src}
        width={width}
        height={height}
        className="size-full object-cover"
        muted
        loop
        preload="metadata"
      />
    </div>
  );
}
