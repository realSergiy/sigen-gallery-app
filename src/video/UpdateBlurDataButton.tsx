import { clsx } from 'clsx/lite';
import { FiRotateCcw } from 'react-icons/fi';
import { getImageBlurAction } from './actions';
import { useState } from 'react';
import Spinner from '@/components/Spinner';

export default function UpdateBlurDataButton({
  videoUrl,
  onUpdatedBlurData,
}: {
  videoUrl?: string;
  onUpdatedBlurData: (blurData: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      className={clsx('flex min-h-9 min-w-[3.25rem] justify-center', 'h-full')}
      disabled={!videoUrl || isLoading}
      onClick={() => {
        if (videoUrl) {
          setIsLoading(true);
          getImageBlurAction(videoUrl)
            .then(blurData => onUpdatedBlurData(blurData))
            .finally(() => setIsLoading(false));
        }
      }}
    >
      {isLoading ? <Spinner /> : <FiRotateCcw size={18} />}
    </button>
  );
}
