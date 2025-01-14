'use client';

import { blobToImage } from '@/utility/blob';
import { useRef, useState } from 'react';
import { CopyExif } from '@/lib/CopyExif';
import { orientation } from 'exifr';
import { clsx } from 'clsx/lite';
import { ACCEPTED_PHOTO_FILE_TYPES } from '@/photo';
import { FiUploadCloud } from 'react-icons/fi';
import { MAX_IMAGE_SIZE } from '@/services/next-image';
import ProgressButton from './primitives/ProgressButton';

const INPUT_ID = 'file';

const fixExifOrientation = (exifOrientation: number) => {
  // Reverse engineer orientation so we can copy correct EXIF data
  switch (exifOrientation) {
    case 2:
      return 1;
    case 3:
      return 3;
    case 4:
      return 1;
    case 5:
      return 1;
    case 6:
      return 8;
    case 7:
      return 1;
    case 8:
      return 6;
    default:
      return 1;
  }
};

const applyOrientationTransform = (
  context: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
) => {
  // Orientation transforms from:
  // https://gist.github.com/SagiMedina/f00a57de4e211456225d3114fd10b0d0
  switch (orientation) {
    case 2:
      context.translate(width, 0);
      context.scale(-1, 1);
      break;
    case 3:
      context.translate(width, height);
      context.rotate(Math.PI);
      break;
    case 4:
      context.translate(0, height);
      context.scale(1, -1);
      break;
    case 5:
      canvas.width = height;
      canvas.height = width;
      context.rotate(Math.PI / 2);
      context.scale(1, -1);
      break;
    case 6:
      canvas.width = height;
      canvas.height = width;
      context.rotate(Math.PI / 2);
      context.translate(0, -height);
      break;
    case 7:
      canvas.width = height;
      canvas.height = width;
      context.rotate((3 * Math.PI) / 2);
      context.translate(-width, height);
      context.scale(1, -1);
      break;
    case 8:
      canvas.width = height;
      canvas.height = width;
      context.translate(0, width);
      context.rotate((3 * Math.PI) / 2);
      break;
  }
};

export default function PhotoInput({
  onStart,
  onBlobReady,
  shouldResize,
  maxSize = MAX_IMAGE_SIZE,
  quality = 0.8,
  loading,
  showUploadStatus = true,
  debug,
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement>();
  const [filesLength, setFilesLength] = useState(0);
  const [fileUploadIndex, setFileUploadIndex] = useState(0);
  const [fileUploadName, setFileUploadName] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onStart?.();
    const { files } = e.currentTarget;
    if (!files?.length) return;

    setFilesLength(files.length);
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      setFileUploadIndex(index);
      setFileUploadName(file.name);
      const callbackArgs = {
        extension: file.name.split('.').pop()?.toLowerCase(),
        hasMultipleUploads: files.length > 1,
        isLastBlob: index === files.length - 1,
      };

      const isPng = callbackArgs.extension === 'png';

      const canvas = canvasRef.current;

      // Specify wide gamut to avoid data loss while resizing
      const context = canvas?.getContext('2d', {
        colorSpace: 'display-p3',
      });

      if ((shouldResize || isPng) && canvas && context) {
        // Process images that need resizing
        const image = await blobToImage(file);

        setImage(image);

        context.save();

        let exifOrientation = (await orientation(file).catch(() => 1)) ?? 1;

        // Preserve EXIF data for PNGs
        if (!isPng) {
          exifOrientation = fixExifOrientation(exifOrientation);
        }

        const ratio = image.width / image.height;

        const width = Math.round(ratio >= 1 ? maxSize : maxSize * ratio);
        const height = Math.round(ratio >= 1 ? maxSize / ratio : maxSize);

        canvas.width = width;
        canvas.height = height;

        // Orientation transforms from:
        // https://gist.github.com/SagiMedina/f00a57de4e211456225d3114fd10b0d0

        applyOrientationTransform(context, exifOrientation, width, height, canvas);

        context.drawImage(image, 0, 0, width, height);

        context.restore();

        canvas.toBlob(
          blob => {
            void (async () => {
              if (blob) {
                const blobWithExif = await CopyExif(file, blob).catch(() => blob);
                await onBlobReady?.({
                  ...callbackArgs,
                  blob: blobWithExif,
                });
              }
            })();
          },
          'image/jpeg',
          quality,
        );
      } else {
        // No need to process
        await onBlobReady?.({
          ...callbackArgs,
          blob: file,
        });
      }
    }
  };

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
              : 'Upload Photos'}
          </ProgressButton>
          <input
            ref={inputRef}
            id={INPUT_ID}
            type="file"
            className="!hidden"
            accept={ACCEPTED_PHOTO_FILE_TYPES.join(',')}
            disabled={loading}
            multiple
            onChange={handleFileChange}
          />
        </label>
        {showUploadStatus && filesLength > 0 && (
          <div className="max-w-full truncate">{fileUploadName}</div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className={clsx(
          'rounded-md bg-gray-50 dark:bg-gray-900/50',
          'border border-gray-200 dark:border-gray-800',
          'w-[400px]',
          (!image || !debug) && 'hidden',
        )}
      />
    </div>
  );
}
