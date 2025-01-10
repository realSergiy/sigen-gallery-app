'use client';

import { Photo, titleForPhoto } from '@/photo';
import AdminTable from './AdminTable';
import { Fragment } from 'react';
import PhotoSmall from '@/photo/PhotoSmall';
import { clsx } from 'clsx/lite';
import { pathForAdminPhotoEdit, pathForPhoto } from '@/site/paths';
import Link from 'next/link';
import { AiOutlineEyeInvisible } from 'react-icons/ai';
import PhotoDate from '@/photo/PhotoDate';
import EditButton from './EditButton';
import { useAppState } from '@/state/AppState';
import PhotoSyncButton from './PhotoSyncButton';
import DeletePhotoButton from './DeletePhotoButton';
import { RevalidateMedia } from '@/media';

export default function AdminPhotosTable({
  photos,
  onLastPhotoVisible,
  revalidatePhoto,
  photoIdsSyncing = [],
  hasAiTextGeneration,
  showUpdatedAt,
  canEdit = true,
  canDelete = true,
}: {
  photos: Photo[];
  onLastPhotoVisible?: () => void;
  revalidatePhoto?: RevalidateMedia;
  photoIdsSyncing?: string[];
  hasAiTextGeneration: boolean;
  showUpdatedAt?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const { invalidateSwr } = useAppState();

  const opacityForPhotoId = (photoId: string) =>
    photoIdsSyncing.length > 0 && !photoIdsSyncing.includes(photoId) ? 'opacity-40' : undefined;

  return (
    <AdminTable>
      {photos.map((photo, index) => (
        <Fragment key={photo.id}>
          <PhotoSmall
            photo={photo}
            onVisible={index === photos.length - 1 ? onLastPhotoVisible : undefined}
            className={opacityForPhotoId(photo.id)}
          />
          <div className={clsx('flex flex-col lg:flex-row', opacityForPhotoId(photo.id))}>
            <Link
              key={photo.id}
              href={pathForPhoto({ photo })}
              className="flex items-center gap-2 lg:w-1/2"
              prefetch={false}
            >
              <span className={clsx(photo.hidden && 'text-dim')}>
                {titleForPhoto(photo)}
                {photo.hidden && (
                  <span className="whitespace-nowrap">
                    {' '}
                    <AiOutlineEyeInvisible className="inline translate-y-[-0.5px]" size={16} />
                  </span>
                )}
              </span>
              {photo.priorityOrder !== null && (
                <span
                  className={clsx(
                    'rounded-sm px-1.5 py-1 text-xs leading-none',
                    'dark:text-gray-300',
                    'bg-gray-100 dark:bg-gray-800',
                  )}
                >
                  {photo.priorityOrder}
                </span>
              )}
            </Link>
            <div className={clsx('uppercase lg:w-1/2', 'text-dim')}>
              <PhotoDate
                {...{
                  photo,
                  dateType: showUpdatedAt ? 'updatedAt' : 'createdAt',
                }}
              />
            </div>
          </div>
          <div className={clsx('flex flex-nowrap', 'items-center gap-2 sm:gap-3')}>
            {canEdit && <EditButton path={pathForAdminPhotoEdit(photo)} />}
            <PhotoSyncButton
              photoId={photo.id}
              photoTitle={titleForPhoto(photo)}
              onSyncComplete={invalidateSwr}
              isSyncingExternal={photoIdsSyncing.includes(photo.id)}
              hasAiTextGeneration={hasAiTextGeneration}
              disabled={photoIdsSyncing.length > 0}
              className={opacityForPhotoId(photo.id)}
              shouldConfirm
              shouldToast
            />
            {canDelete && (
              <DeletePhotoButton
                photo={photo}
                onDelete={() => void revalidatePhoto?.(photo.id, true)}
              />
            )}
          </div>
        </Fragment>
      ))}
    </AdminTable>
  );
}
