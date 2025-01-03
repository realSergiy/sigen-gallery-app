import { getPhotoCached } from '@/photo/cache';
import { PhotoCameraProps, cameraFromPhoto } from '@/camera';
import PhotoShareModal from '@/photo/PhotoShareModal';
import { PATH_ROOT } from '@/site/paths';
import { redirect } from 'next/navigation';

export default async function Share(props: PhotoCameraProps) {
  const params = await props.params;

  const { photoId, make, model } = params;

  const photo = await getPhotoCached(photoId);

  if (!photo) {
    return redirect(PATH_ROOT);
  }

  const camera = cameraFromPhoto(photo, { make, model });

  return <PhotoShareModal {...{ photo, camera }} />;
}
