'use client';

import { useRef, useState, useTransition } from 'react';
import { clsx } from 'clsx/lite';
import { FiUploadCloud } from 'react-icons/fi';
import { ACCEPTED_VIDEO_FILE_TYPES } from '@/video';
import { uploadVideoFromClient } from '@/services/storage';
import { PATH_ADMIN_VIDEO_UPLOADS, pathForAdminVideoUploadUrl } from '@/site/paths';
import { useRouter } from 'next/navigation';
import { getMessage } from '@/utility/error';
import ProgressButton from '@/components/primitives/ProgressButton';

const INPUT_ID = 'file';

type VideoUploadProps = {
  onLastUpload?: () => Promise<void>;
};

export default function VideoUpload({ onLastUpload }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [filesLength, setFilesLength] = useState(0);
  const [fileUploadIndex, setFileUploadIndex] = useState(0);
  const [fileUploadName, setFileUploadName] = useState('');

  const router = useRouter();

  const [uploadError, setUploadError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (!files?.length) return;

    setFilesLength(files.length);
    setUploadError('');

    startTransition(async () => {
      try {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          const extension = file.name.split('.').pop()?.toLowerCase();

          setFileUploadIndex(index);
          setFileUploadName(file.name);

          const url = await uploadVideoFromClient(file, extension);

          if (index === files.length - 1) {
            // is last blob
            await onLastUpload?.();
            if (files.length > 1) {
              // Redirect to view multiple uploads
              router.push(PATH_ADMIN_VIDEO_UPLOADS);
            } else {
              // Redirect to video detail page
              router.push(pathForAdminVideoUploadUrl(url));
            }
          }
        }
      } catch (e) {
        setUploadError(`Upload Error: ${getMessage(e)}`);
      }
    });
  };

  return (
    <div className={clsx('space-y-4', isPending && 'cursor-not-allowed')}>
      <form className="flex min-w-0 items-center gap-2 sm:gap-4">
        <label
          htmlFor={INPUT_ID}
          className={clsx(
            'text-main shrink-0 select-none',
            isPending && 'pointer-events-none cursor-not-allowed',
          )}
        >
          <ProgressButton
            type="button"
            isLoading={isPending}
            progress={filesLength > 1 ? ((fileUploadIndex + 1) / filesLength) * 0.95 : undefined}
            icon={<FiUploadCloud size={18} className="translate-x-[-0.5px] translate-y-[0.5px]" />}
            aria-disabled={isPending}
            onClick={() => inputRef.current?.click()}
            hideTextOnMobile={false}
            primary
          >
            {isPending
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
            disabled={isPending}
            multiple
            onChange={handleFileChange}
          />
        </label>
        {filesLength > 0 && <div className="max-w-full truncate">{fileUploadName}</div>}
      </form>
      {uploadError && <div className="text-error">{uploadError}</div>}
    </div>
  );
}
