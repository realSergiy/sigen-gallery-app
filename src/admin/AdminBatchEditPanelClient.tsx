'use client';

import Note from '@/components/Note';
import LoaderButton from '@/components/primitives/LoaderButton';
import SiteGrid from '@/components/SiteGrid';
import { useAppState } from '@/state/AppState';
import { clsx } from 'clsx/lite';
import { IoCloseSharp } from 'react-icons/io5';
import { useState } from 'react';
import { TAG_FAVS, Tags } from '@/tag';
import { usePathname } from 'next/navigation';
import PhotoTagFieldset from './PhotoTagFieldset';
import { tagMultiplePhotosAction } from '@/photo/serverFunctions';
import { toastSuccess } from '@/toast';
import DeletePhotosButton from './DeletePhotosButton';
import { photoQuantityText } from '@/photo';
import { FaArrowDown, FaCheck, FaRegStar } from 'react-icons/fa6';
import ResponsiveText from '@/components/primitives/ResponsiveText';
import { PATH_VIDEO_GRID_INFERRED } from '@/site/paths';

export default function AdminBatchEditPanelClient({ uniqueTags }: { uniqueTags: Tags }) {
  const pathname = usePathname();

  const {
    isUserSignedIn,
    selectedPhotoIds,
    setSelectedPhotoIds,
    isPerformingSelectEdit,
    setIsPerformingSelectEdit,
  } = useAppState();

  const [tags, setTags] = useState<string>();
  const [tagErrorMessage, setTagErrorMessage] = useState('');
  const isInTagMode = tags !== undefined;

  const resetForm = () => {
    setSelectedPhotoIds?.(undefined);
    setTags(undefined);
    setTagErrorMessage('');
  };

  const photosText = photoQuantityText(selectedPhotoIds?.length ?? 0, false, false);

  const renderPhotoCTA = () =>
    selectedPhotoIds?.length === 0 ? (
      <>
        <FaArrowDown />
        Select photos below
      </>
    ) : (
      <ResponsiveText shortText={photosText}>{photosText} selected</ResponsiveText>
    );

  const renderActions = () =>
    isInTagMode ? (
      <>
        <LoaderButton
          className="min-h-10"
          icon={<IoCloseSharp size={19} className="translate-y-[0.5px]" />}
          onClick={() => {
            setTags(undefined);
            setTagErrorMessage('');
          }}
          disabled={isPerformingSelectEdit}
        >
          Cancel
        </LoaderButton>
        <LoaderButton
          className="min-h-10"
          icon={<FaCheck size={15} />}
          confirmText={`Are you sure you want to apply tags to ${photosText}? This action cannot be undone.`}
          onClick={() => {
            setIsPerformingSelectEdit?.(true);
            tagMultiplePhotosAction(tags, selectedPhotoIds ?? [])
              .then(() => {
                toastSuccess(`${photosText} tagged`);
                resetForm();
              })
              .finally(() => setIsPerformingSelectEdit?.(false));
          }}
          disabled={
            !tags ||
            Boolean(tagErrorMessage) ||
            (selectedPhotoIds?.length ?? 0) === 0 ||
            isPerformingSelectEdit
          }
          primary
        >
          Apply Tags
        </LoaderButton>
      </>
    ) : (
      <>
        {(selectedPhotoIds?.length ?? 0) > 0 && (
          <>
            <DeletePhotosButton
              photoIds={selectedPhotoIds}
              disabled={isPerformingSelectEdit}
              onClick={() => setIsPerformingSelectEdit?.(true)}
              onDelete={resetForm}
              onFinish={() => setIsPerformingSelectEdit?.(false)}
            />
            <LoaderButton
              icon={<FaRegStar />}
              disabled={isPerformingSelectEdit}
              confirmText={`Are you sure you want to favorite ${photosText}?`}
              onClick={() => {
                setIsPerformingSelectEdit?.(true);
                tagMultiplePhotosAction(TAG_FAVS, selectedPhotoIds ?? [])
                  .then(() => {
                    toastSuccess(`${photosText} favorited`);
                    resetForm();
                  })
                  .finally(() => setIsPerformingSelectEdit?.(false));
              }}
            />
            <LoaderButton onClick={() => setTags('')} disabled={isPerformingSelectEdit}>
              <ResponsiveText shortText="Tag">Tag ...</ResponsiveText>
            </LoaderButton>
          </>
        )}
        <LoaderButton
          icon={<IoCloseSharp size={20} className="translate-y-[0.5px]" />}
          onClick={() => setSelectedPhotoIds?.(undefined)}
        />
      </>
    );

  return isUserSignedIn &&
    pathname === PATH_VIDEO_GRID_INFERRED &&
    selectedPhotoIds !== undefined ? (
    <SiteGrid
      className="sticky top-0 z-10 -mt-2 mb-5 pt-2"
      contentMain={
        <div className="flex flex-col gap-2">
          <Note
            color="gray"
            className={clsx(
              'min-h-14',
              '!border-transparent backdrop-blur-lg',
              '!text-gray-900 dark:!text-gray-100',
              '!bg-gray-100/90 dark:!bg-gray-900/70',
              // Override default <Note /> content spacing
              '[&>*>*:first-child]:gap-1.5 [&>*>*:first-child]:sm:gap-2.5',
            )}
            padding={isInTagMode ? 'tight-cta-right-left' : 'tight-cta-right'}
            cta={<div className="flex items-center gap-1.5 sm:gap-2.5">{renderActions()}</div>}
            spaceChildren={false}
            hideIcon
          >
            {isInTagMode ? (
              <PhotoTagFieldset
                tags={tags}
                tagOptions={uniqueTags}
                placeholder={`Tag ${photosText} ...`}
                onChange={setTags}
                onError={setTagErrorMessage}
                readOnly={isPerformingSelectEdit}
                openOnLoad
                hideLabel
              />
            ) : (
              <div className="flex items-center gap-2 text-base">{renderPhotoCTA()}</div>
            )}
          </Note>
          {tagErrorMessage && <div className="text-error pl-4">{tagErrorMessage}</div>}
        </div>
      }
    />
  ) : null;
}
