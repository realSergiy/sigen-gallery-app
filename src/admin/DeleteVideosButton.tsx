'use client';

import LoaderButton from '@/components/primitives/LoaderButton';
import { videoQuantityText } from '@/video';
import { deleteVideosAction } from '@/video/actions';
import { useAppState } from '@/state/AppState';
import { toastSuccess, toastWarning } from '@/toast';
import { ComponentProps, useState } from 'react';
import DeleteButton from './DeleteButton';

export default function DeleteVideosButton({
  videoIds = [],
  onDelete,
  clearLocalState = true,
  onClick,
  onFinish,
  confirmText,
  toastText,
  ...rest
}: {
  videoIds?: string[];
  onClick?: () => void;
  onFinish?: () => void;
  onDelete?: () => void;
  clearLocalState?: boolean;
  toastText?: string;
} & ComponentProps<typeof LoaderButton>) {
  const [isLoading, setIsLoading] = useState(false);

  const videosText = videoQuantityText(videoIds.length, false, false);

  const { invalidateSwr, registerAdminUpdate } = useAppState();

  return (
    <DeleteButton
      {...rest}
      isLoading={isLoading}
      confirmText={
        confirmText ??
        `Are you sure you want to delete ${videosText}? This action cannot be undone.`
      }
      onClick={() => {
        onClick?.();
        setIsLoading(true);
        deleteVideosAction(videoIds)
          .then(() => {
            toastSuccess(toastText ?? `${videosText} deleted`);
            if (clearLocalState) {
              invalidateSwr?.();
              registerAdminUpdate?.();
            }
            onDelete?.();
          })
          .catch(() => toastWarning(`Failed to delete ${videosText}`))
          .finally(() => {
            setIsLoading(false);
            onFinish?.();
          });
      }}
    />
  );
}
