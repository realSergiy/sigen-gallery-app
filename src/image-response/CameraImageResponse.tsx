import { Photo } from '../photo';
import ImageCaption from './components/ImageCaption';
import MediaPhotoGrid from './components/ImagePhotoGrid';
import ImageContainer from './components/ImageContainer';
import { Camera, cameraFromPhoto, formatCameraText } from '@/camera';
import { IoMdCamera } from 'react-icons/io';
import { NextImageSize } from '@/services/next-image';

export default function CameraImageResponse({
  camera: cameraProperty,
  photos,
  width,
  height,
  fontFamily,
}: {
  camera: Camera;
  photos: Photo[];
  width: NextImageSize;
  height: number;
  fontFamily: string;
}) {
  const camera = cameraFromPhoto(photos[0], cameraProperty);
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
            <IoMdCamera
              size={height * 0.079}
              style={{
                transform: `translateY(${height * 0.003}px)`,
                marginRight: height * 0.015,
              }}
            />
          ),
        }}
      >
        {formatCameraText(camera).toLocaleUpperCase()}
      </ImageCaption>
    </ImageContainer>
  );
}
