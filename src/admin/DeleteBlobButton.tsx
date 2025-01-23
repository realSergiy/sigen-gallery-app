'use client';

import DeleteButton from './DeleteButton';
import { useRouter } from 'next/navigation';
import { PATH_ADMIN_VIDEOS } from '@/site/paths';
import { useState } from 'react';
import { deleteUploadAction } from '@/media/serverFunctions';

type DeleteBlobOptionsProps = {
  url: string;
  shouldRedirectToAdmin?: boolean;
  shouldDeleteRelated?: boolean;
  onDelete?: () => void;
};

export default function DeleteUploadButton({
  url,
  shouldRedirectToAdmin,
  shouldDeleteRelated = false,
  onDelete,
}: DeleteBlobOptionsProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <DeleteButton
      confirmText="Are you sure you want to delete this upload?"
      onClick={() => {
        setIsDeleting(true);
        deleteUploadAction(url, shouldDeleteRelated)
          .then(() => {
            onDelete?.();
            if (shouldRedirectToAdmin) {
              router.push(PATH_ADMIN_VIDEOS);
            } else {
              setIsDeleting(false);
            }
          })
          .catch(() => setIsDeleting(false));
      }}
      isLoading={isDeleting}
    />
  );
}
