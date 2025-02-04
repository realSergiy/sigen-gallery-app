import { Photo, PhotoDateRange } from '@/photo';
import { pathForCameraShare } from '@/site/paths';
import PhotoHeader from '@/photo/PhotoHeader';
import { Camera, cameraFromPhoto } from '.';
import PhotoCamera from './PhotoCamera';
import { descriptionForCameraPhotos } from './meta';

export default function CameraHeader({
  camera: cameraProperty,
  photos,
  selectedPhoto,
  indexNumber,
  count,
  dateRange,
}: {
  camera: Camera;
  photos: Photo[];
  selectedPhoto?: Photo;
  indexNumber?: number;
  count?: number;
  dateRange?: PhotoDateRange;
}) {
  const camera = cameraFromPhoto(photos[0], cameraProperty);
  return (
    <PhotoHeader
      camera={camera}
      entity={<PhotoCamera {...{ camera }} contrast="high" hideAppleIcon />}
      entityDescription={descriptionForCameraPhotos(photos, undefined, count, dateRange)}
      photos={photos}
      selectedPhoto={selectedPhoto}
      sharePath={pathForCameraShare(camera)}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />
  );
}
