import LoaderButton from '@/components/primitives/LoaderButton';
import { syncVideoAction } from '@/video/serverFunctions';
import IconGrSync from '@/site/IconGrSync';
import { toastSuccess } from '@/toast';
import { ComponentProps, useState } from 'react';

export default function VideoSyncButton({
  videoId,
  videoTitle,
  onSyncComplete,
  className,
  isSyncingExternal,
  disabled,
  shouldConfirm,
  shouldToast,
}: {
  videoId: string;
  videoTitle?: string;
  onSyncComplete?: () => void;
  isSyncingExternal?: boolean;
  shouldConfirm?: boolean;
  shouldToast?: boolean;
} & ComponentProps<typeof LoaderButton>) {
  const [isSyncing, setIsSyncing] = useState(false);

  const confirmText = ['Overwrite'];
  if (videoTitle) {
    confirmText.push(`"${videoTitle}"`);
  }
  confirmText.push('data from original file?', 'This action cannot be undone.');

  return (
    <LoaderButton
      title="Update video from original file"
      className={className}
      icon={<IconGrSync className="translate-x-[0.5px] translate-y-[0.5px]" />}
      onClick={() => {
        if (!shouldConfirm || window.confirm(confirmText.join(' '))) {
          setIsSyncing(true);
          syncVideoAction(videoId)
            .then(() => {
              onSyncComplete?.();
              if (shouldToast) {
                toastSuccess(videoTitle ? `"${videoTitle}" data synced` : 'Data synced');
              }
            })
            .finally(() => setIsSyncing(false));
        }
      }}
      isLoading={isSyncing || isSyncingExternal}
      disabled={disabled}
    />
  );
}
