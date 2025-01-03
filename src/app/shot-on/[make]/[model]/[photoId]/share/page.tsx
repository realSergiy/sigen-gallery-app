import { getPhotoCached } from '@/photo/cache';
import { cameraFromPhoto, CameraPhotoId } from '@/camera';
import PhotoShareModal from '@/photo/PhotoShareModal';
import { PATH_ROOT } from '@/site/paths';
import { redirect } from 'next/navigation';

type SharePageProps = {
  params: Promise<CameraPhotoId>;
};

export default async function Share({ params }: SharePageProps) {
  const { photoId, make, model } = await params;

  const photo = await getPhotoCached(photoId);

  if (!photo) {
    return redirect(PATH_ROOT);
  }

  const camera = cameraFromPhoto(photo, { make, model });

  return <PhotoShareModal {...{ photo, camera }} />;
}
