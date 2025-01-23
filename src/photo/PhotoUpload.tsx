'use client';

import { useState } from 'react';
import { uploadPhotoFromClient } from '@/services/storage';
import { useRouter } from 'next/navigation';
import { PATH_ADMIN_PHOTO_UPLOADS, pathForAdminPhotoUploadUrl } from '@/site/paths';
import PhotoInput from '../components/PhotoInput';
import { clsx } from 'clsx/lite';

export default function PhotoUpload({
  shouldResize,
  onLastUpload,
  isUploading,
  setIsUploading,
  showUploadStatus,
}: {
  shouldResize?: boolean;
  onLastUpload?: () => Promise<void>;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  showUploadStatus?: boolean;
}) {
  const [uploadError, setUploadError] = useState<string>();
  const router = useRouter();

  return (
    <div className={clsx('space-y-4', isUploading && 'cursor-not-allowed')}>
      <div className="flex items-center gap-8">
        <form className="flex min-w-0 items-center">
          <PhotoInput
            loading={isUploading}
            shouldResize={shouldResize}
            onStart={() => {
              setIsUploading(true);
              setUploadError('');
            }}
            onBlobReady={async ({ blob, extension, hasMultipleUploads, isLastBlob }) => {
              return uploadPhotoFromClient(blob, extension)
                .then(async url => {
                  if (isLastBlob) {
                    await onLastUpload?.();
                    if (hasMultipleUploads) {
                      // Redirect to view multiple uploads
                      router.push(PATH_ADMIN_PHOTO_UPLOADS);
                    } else {
                      // Redirect to photo detail page
                      router.push(pathForAdminPhotoUploadUrl(url));
                    }
                  }
                })
                .catch(e => {
                  setIsUploading(false);
                  setUploadError(`Upload Error: ${e.message}`);
                });
            }}
            showUploadStatus={showUploadStatus}
          />
        </form>
      </div>
      {uploadError && <div className="text-error">{uploadError}</div>}
    </div>
  );
}
