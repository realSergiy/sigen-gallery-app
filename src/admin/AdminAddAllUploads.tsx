'use client';

import ErrorNote from '@/components/ErrorNote';
import FieldSetWithStatus from '@/components/FieldSetWithStatus';
import Container from '@/components/Container';
import { addAllUploadsAction } from '@/photo/serverFunctions';
import { PATH_ADMIN_PHOTOS } from '@/site/paths';
import type { Tags } from '@/tag';
import { generateLocalNaivePostgresString, generateLocalPostgresString } from '@/utility/date';
import sleep from '@/utility/sleep';
import { readStreamableValue } from 'ai/rsc';
import { clsx } from 'clsx/lite';
import { useRouter } from 'next/navigation';
import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import { BiCheckCircle, BiImageAdd } from 'react-icons/bi';
import ProgressButton from '@/components/primitives/ProgressButton';
import type { UrlAddStatus } from './AdminUploadsClient';
import PhotoTagFieldset from './PhotoTagFieldset';
import { getMessage } from '@/utility/error';

const UPLOAD_BATCH_SIZE = 4;

type AdminAddAllUploadsProps = {
  uploadUrls: string[];
  uniqueTags?: Tags;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  setUrlAddStatuses: Dispatch<SetStateAction<UrlAddStatus[]>>;
};

export default function AdminAddAllUploads({
  uploadUrls,
  uniqueTags,
  isAdding,
  setIsAdding,
  setUrlAddStatuses,
}: AdminAddAllUploadsProps) {
  const [buttonText, setButtonText] = useState('Add All Uploads');
  const [showTags, setShowTags] = useState(false);
  const [tags, setTags] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [tagErrorMessage, setTagErrorMessage] = useState('');
  const [addingProgress, setAddingProgress] = useState<number>();
  const [isAddingComplete, setIsAddingComplete] = useState(false);
  const router = useRouter();
  const addedUploadCount = useRef(0);

  const uploadCount = uploadUrls.length;

  const addUploadUrls = async (uploadUrls: string[]) => {
    try {
      const stream = await addAllUploadsAction({
        uploadUrls,
        tags: showTags ? tags : undefined,
        takenAtLocal: generateLocalPostgresString(),
        takenAtNaiveLocal: generateLocalNaivePostgresString(),
      });
      for await (const data of readStreamableValue(stream)) {
        setButtonText(
          addedUploadCount.current === 0
            ? `Adding 1 of ${uploadCount}`
            : `Adding ${addedUploadCount.current + 1} of ${uploadCount}`,
        );
        setUrlAddStatuses(current => {
          const update = current.map(status =>
            status.url === data?.url
              ? {
                  ...status,
                  // Prevent status regressions
                  status: status.status === 'added' ? 'added' : data.status,
                  statusMessage: data.statusMessage,
                  progress: data.progress,
                }
              : status,
          );
          addedUploadCount.current = update.filter(({ status }) => status === 'added').length;
          return update;
        });
        setAddingProgress((current = 0) => {
          const updatedProgress =
            (((addedUploadCount.current || 1) - 1 + (data?.progress ?? 0)) / uploadCount) * 0.95;
          // Prevent out-of-order updates causing progress to go backwards
          return Math.max(current, updatedProgress);
        });
      }
    } catch (e) {
      setIsAdding(false);
      setButtonText('Try Again');
      setAddingProgress(undefined);
      setActionErrorMessage(getMessage(e));
    }
  };

  const addUploadUrlsInBatches = async (uploads: string[]) => {
    if (uploads.length === 0) {
      return;
    }

    const chunk = uploads.splice(0, UPLOAD_BATCH_SIZE);

    await addUploadUrls(chunk);
    return await addUploadUrlsInBatches(uploads);
  };

  const handleAddClick = () => {
    if (!confirm(`Are you sure you want to add all ${uploadCount} uploads?`)) {
      return;
    }

    setIsAdding(true);
    setUrlAddStatuses(current =>
      current.map((item, index) => ({
        ...item,
        status: index === 0 ? 'adding' : 'waiting',
      })),
    );

    const uploadsToAdd = [...uploadUrls];

    addUploadUrlsInBatches(uploadsToAdd)
      .then(() => {
        setButtonText('Complete');
        setAddingProgress(1);
        setIsAdding(false);
        setIsAddingComplete(true);
      })
      .then(() => sleep(1000))
      .then(() => {
        router.push(PATH_ADMIN_PHOTOS);
      })
      .catch(e => {
        setAddingProgress(undefined);
        setIsAdding(false);
        setButtonText('Try Again');
        setActionErrorMessage(getMessage(e));
      });
  };

  return (
    <>
      {actionErrorMessage && <ErrorNote>{actionErrorMessage}</ErrorNote>}
      <Container padding="tight">
        <div className="w-full space-y-4 py-1">
          <div className="flex">
            <div className={clsx('grow', tagErrorMessage ? 'text-error' : 'text-main')}>
              {showTags
                ? tagErrorMessage || 'Add tags to all uploads'
                : `Found ${uploadCount} uploads`}
            </div>
            <FieldSetWithStatus
              id="show-tags"
              label="Apply tags"
              type="checkbox"
              value={showTags ? 'true' : 'false'}
              onChange={value => setShowTags(value === 'true')}
              readOnly={isAdding}
            />
          </div>
          {showTags && !actionErrorMessage && (
            <PhotoTagFieldset
              tags={tags}
              tagOptions={uniqueTags}
              onChange={setTags}
              onError={setTagErrorMessage}
              readOnly={isAdding}
              openOnLoad
              hideLabel
            />
          )}
          <div className="space-y-2">
            <ProgressButton
              primary
              className="w-full justify-center"
              progress={addingProgress}
              isLoading={isAdding}
              disabled={Boolean(tagErrorMessage) || isAddingComplete}
              icon={
                isAddingComplete ? (
                  <BiCheckCircle size={18} className="translate-x-px" />
                ) : (
                  <BiImageAdd size={18} className="translate-x-px" />
                )
              }
              onClick={handleAddClick}
              hideTextOnMobile={false}
            >
              {buttonText}
            </ProgressButton>
          </div>
        </div>
      </Container>
    </>
  );
}
