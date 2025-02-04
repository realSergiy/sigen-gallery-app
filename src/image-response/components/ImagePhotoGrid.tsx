/* eslint-disable @next/next/no-img-element */

// My understanding is that Next Image is a client component and cannot be used here.
// This grid is meant to render on the server to generate the OG image.

import { Media } from '@/media';
import { NextImageSize, getNextImageUrlForRequest } from '@/services/next-image';

export default function MediaPhotoGrid({
  medias,
  width,
  widthArbitrary,
  height,
  imagePosition = 'center',
  gap = 4,
}: {
  medias: Media[];
  height: number;
  imagePosition?: 'center' | 'top';
  gap?: number;
} & (
  | { width: NextImageSize; widthArbitrary?: undefined }
  | { width?: undefined; widthArbitrary: number }
)) {
  let count = 1;
  if (medias.length >= 12) {
    count = 12;
  } else if (medias.length >= 6) {
    count = 6;
  } else if (medias.length >= 4) {
    count = 4;
  } else if (medias.length >= 2) {
    count = 2;
  }

  const nextImageWidth: NextImageSize = count <= 2 ? (width ?? 1080) : 640;

  let rows = 1;
  if (count > 12) {
    rows = 4;
  } else if (count > 6) {
    rows = 3;
  } else if (count > 3) {
    rows = 2;
  }

  const imagesPerRow = count / rows;

  const cellWidth =
    (width ?? widthArbitrary) / imagesPerRow - ((imagesPerRow - 1) * gap) / imagesPerRow;
  const cellHeight = height / rows - ((rows - 1) * gap) / rows;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
      }}
    >
      {medias.slice(0, count).map(({ id, url, title }) => (
        <div
          key={id}
          style={{
            display: 'flex',
            width: cellWidth,
            height: cellHeight,
            overflow: 'hidden',
            filter: 'saturate(1.1)',
          }}
        >
          <img
            {...{
              src: getNextImageUrlForRequest(url, nextImageWidth),
              alt: title ?? '',
              style: {
                width: '100%',
                ...(imagePosition === 'center' && {
                  height: '100%',
                }),
                objectFit: 'cover',
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}
