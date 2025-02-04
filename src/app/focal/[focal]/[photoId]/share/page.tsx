import { getFocalLengthFromString } from '@/focal';
import { getPhotoCached } from '@/photo/cache';
import PhotoShareModal from '@/photo/PhotoShareModal';
import { PATH_ROOT } from '@/site/paths';
import { redirect } from 'next/navigation';

export default async function Share(props: {
  params: Promise<{ photoId: string; focal: string }>;
}) {
  const params = await props.params;

  const { photoId, focal: focalString } = params;

  const focal = getFocalLengthFromString(focalString);

  const photo = await getPhotoCached(photoId);

  if (!photo) {
    return redirect(PATH_ROOT);
  }

  return <PhotoShareModal {...{ photo, focal }} />;
}
