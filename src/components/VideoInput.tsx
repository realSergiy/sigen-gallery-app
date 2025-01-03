'use client';

import { useRef, useState } from 'react';
import { clsx } from 'clsx/lite';

import { FiUploadCloud } from 'react-icons/fi';
import ProgressButton from './primitives/ProgressButton';
import { ACCEPTED_VIDEO_FILE_TYPES } from '@/video';

const INPUT_ID = 'file';

export default function VideoInput({
  onStart,
  onBlobReady,
  loading,
  showUploadStatus = true,
}: {
  onStart?: () => void;
  onBlobReady?: (args: {
    blob: Blob;
    extension?: string;
    hasMultipleUploads?: boolean;
    isLastBlob?: boolean;
  }) => Promise<unknown>;
  shouldResize?: boolean;
  maxSize?: number;
  quality?: number;
  loading?: boolean;
  showUploadStatus?: boolean;
  debug?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [filesLength, setFilesLength] = useState(0);
  const [fileUploadIndex, setFileUploadIndex] = useState(0);
  const [fileUploadName, setFileUploadName] = useState('');

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <label
          htmlFor={INPUT_ID}
          className={clsx(
            'text-main shrink-0 select-none',
            loading && 'pointer-events-none cursor-not-allowed',
          )}
        >
          <ProgressButton
            type="button"
            isLoading={loading}
            progress={filesLength > 1 ? ((fileUploadIndex + 1) / filesLength) * 0.95 : undefined}
            icon={<FiUploadCloud size={18} className="translate-x-[-0.5px] translate-y-[0.5px]" />}
            aria-disabled={loading}
            onClick={() => inputRef.current?.click()}
            hideTextOnMobile={false}
            primary
          >
            {loading
              ? filesLength > 1
                ? `Uploading ${fileUploadIndex + 1} of ${filesLength}`
                : 'Uploading'
              : 'Upload Videos'}
          </ProgressButton>
          <input
            ref={inputRef}
            id={INPUT_ID}
            type="file"
            className="!hidden"
            accept={ACCEPTED_VIDEO_FILE_TYPES.join(',')}
            disabled={loading}
            multiple
            onChange={async e => {
              onStart?.();
              const { files } = e.currentTarget;
              if (files && files.length > 0) {
                setFilesLength(files.length);
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  setFileUploadIndex(i);
                  setFileUploadName(file.name);
                  await onBlobReady?.({
                    blob: file,
                    extension: file.name.split('.').pop()?.toLowerCase(),
                    hasMultipleUploads: files.length > 1,
                    isLastBlob: i === files.length - 1,
                  });
                }
              }
            }}
          />
        </label>
        {showUploadStatus && filesLength > 0 && (
          <div className="max-w-full truncate">{fileUploadName}</div>
        )}
      </div>
    </div>
  );
}
