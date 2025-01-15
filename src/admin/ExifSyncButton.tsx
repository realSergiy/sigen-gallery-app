'use client';

import LoaderButton from '@/components/primitives/LoaderButton';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import { getExifDataAction } from '@/photo/serverFunctions';
import { PhotoFormData } from '@/photo/form';
import IconGrSync from '@/site/IconGrSync';
import { clsx } from 'clsx/lite';
import { ComponentProps, useState } from 'react';

export default function ExifSyncButton({
  photoUrl,
  onSync,
}: {
  photoUrl: string;
  onSync?: (data: Partial<PhotoFormData>) => void;
} & ComponentProps<typeof SubmitButtonWithStatus>) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderButton
      title="Update photo from original file"
      isLoading={isLoading}
      onClick={() => {
        setIsLoading(true);
        getExifDataAction(photoUrl)
          .then(onSync)
          .finally(() => setIsLoading(false));
      }}
      icon={
        <IconGrSync
          className={clsx('translate-x-[0.5px] translate-y-[0.5px]', 'sm:translate-x-[-0.5px]')}
        />
      }
    >
      EXIF
    </LoaderButton>
  );
}
