import type { Photo } from '../photo';
import ImageCaption from './components/ImageCaption';
import MediaPhotoGrid from './components/ImagePhotoGrid';
import ImageContainer from './components/ImageContainer';
import type { NextImageSize } from '@/services/next-image';
import { TbCone } from 'react-icons/tb';
import { formatFocalLength } from '@/focal';

export default function FocalLengthImageResponse({
  focal,
  photos,
  width,
  height,
  fontFamily,
}: {
  focal: number;
  photos: Photo[];
  width: NextImageSize;
  height: number;
  fontFamily: string;
}) {
  return (
    <ImageContainer
      {...{
        width,
        height,
        ...(photos.length === 0 && { background: 'black' }),
      }}
    >
      <MediaPhotoGrid
        {...{
          medias: photos,
          width,
          height,
        }}
      />
      <ImageCaption
        {...{
          width,
          height,
          fontFamily,
          icon: (
            <TbCone
              size={height * 0.075}
              style={{
                transform: `translateY(${height * 0.007}px) rotate(270deg)`,
                marginRight: height * 0.01,
              }}
            />
          ),
        }}
      >
        {formatFocalLength(focal)}
      </ImageCaption>
    </ImageContainer>
  );
}
