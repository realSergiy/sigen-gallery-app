'use client';

import ImageSmall from '@/components/image/ImageSmall';
import Spinner from '@/components/Spinner';
import { getIdFromStorageUrl } from '@/services/storage';
import { clsx } from 'clsx/lite';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { pathForAdminUploadUrl } from '@/site/paths';
import AddButton from './AddButton';
import { type UrlAddStatus } from './AdminUploadsClient';
import ResponsiveDate from '@/components/ResponsiveDate';
import DeleteBlobButton from './DeleteBlobButton';

export default function AdminVideoUploadsTable({
  isAdding,
  urlAddStatuses,
  setUrlAddStatuses,
}: {
  isAdding?: boolean;
  urlAddStatuses: UrlAddStatus[];
  setUrlAddStatuses?: (urlAddStatuses: UrlAddStatus[]) => void;
}) {
  const isComplete = urlAddStatuses.every(({ status }) => status === 'added');

  return (
    <div className="space-y-4">
      {urlAddStatuses.map(({ url, status, statusMessage, uploadedAt }) => (
        <div key={url}>
          <div className={clsx('flex min-h-8 w-full items-center gap-2')}>
            <div
              className={clsx(
                'flex grow items-center gap-2',
                'transition-opacity',
                isAdding && !isComplete && status !== 'adding' && 'opacity-30',
              )}
            >
              <div
                className={clsx(
                  'shrink-0 transition-transform',
                  isAdding &&
                    !isComplete &&
                    status === 'adding' &&
                    'translate-x-[-2px] scale-[1.125] shadow-lg',
                  isAdding && !isComplete && status !== 'adding' && 'scale-90',
                )}
              >
                <ImageSmall
                  src={url}
                  alt={url}
                  aspectRatio={3 / 2}
                  className={clsx('overflow-hidden rounded-[3px]', 'border-subtle')}
                />
              </div>
              <span className="min-w-0 grow">
                <div className="overflow-hidden text-ellipsis">
                  {getIdFromStorageUrl(url, 'video')}
                </div>
                <div className="text-dim overflow-hidden text-ellipsis">
                  {isAdding || isComplete ? (
                    status === 'added' ? (
                      'Added'
                    ) : status === 'adding' ? (
                      (statusMessage ?? 'Adding ...')
                    ) : (
                      'Waiting'
                    )
                  ) : uploadedAt ? (
                    <ResponsiveDate date={uploadedAt} />
                  ) : (
                    '—'
                  )}
                </div>
              </span>
            </div>
            <span className="flex items-center gap-2">
              {isAdding || isComplete ? (
                <>
                  {status === 'added' ? (
                    <FaRegCircleCheck size={18} />
                  ) : status === 'adding' ? (
                    <Spinner size={19} className="translate-y-[2px]" />
                  ) : (
                    <span className="text-dim pr-1.5">—</span>
                  )}
                </>
              ) : (
                <>
                  <AddButton path={pathForAdminUploadUrl(url, 'video')} />
                  <DeleteBlobButton
                    url={url}
                    shouldRedirectToAdmin={urlAddStatuses.length <= 1}
                    shouldDeleteRelated
                    onDelete={() =>
                      setUrlAddStatuses?.(
                        urlAddStatuses.filter(({ url: urlToRemove }) => urlToRemove !== url),
                      )
                    }
                  />
                </>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
