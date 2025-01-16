'use client';

import { useState } from 'react';
import { uploadPhotoFromClient } from '@/services/storage';
import { useRouter } from 'next/navigation';
import { PATH_ADMIN_PHOTO_UPLOADS, pathForAdminPhotoUploadUrl } from '@/site/paths';
import PhotoInput from '../components/PhotoInput';
import { clsx } from 'clsx/lite';
import { getMessage } from '@/utility/error';
export default function PhotoUpload({
  shouldResize,
  onLastUpload,
  isUploading,
  setIsUploading,
  showUploadStatus,
  debug,
}: {
  shouldResize?: boolean;
  onLastUpload?: () => Promise<void>;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  showUploadStatus?: boolean;
  debug?: boolean;
}) {
  const [uploadError, setUploadError] = useState<string>();
  const [debugDownload, setDebugDownload] = useState<{
    href: string;
    fileName: string;
  }>();

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
              if (debug) {
                setDebugDownload({
                  href: URL.createObjectURL(blob),
                  fileName: `debug.${extension}`,
                });
                setIsUploading(false);
                setUploadError('');
              } else {
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
                  .catch((e: unknown) => {
                    setIsUploading(false);
                    setUploadError(`Upload Error: ${getMessage(e)}`);
                  });
              }
            }}
            showUploadStatus={showUploadStatus}
            debug={debug}
          />
        </form>
      </div>
      {debug && debugDownload && (
        <a className="block" href={debugDownload.href} download={debugDownload.fileName}>
          Download
        </a>
      )}
      {uploadError && <div className="text-error">{uploadError}</div>}
    </div>
  );
}
