'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FORM_METADATA_ENTRIES,
  VideoFormData,
  formHasTextContent,
  getChangedFormFields,
  getFormErrors,
  isFormValid,
} from '.';
import { getDimensionsFromSize } from '@/utility/size';
import { convertTagsForForm, Tags } from '@/tag';
import usePreventNavigation from '@/utility/usePreventNavigation';
import { useAppState } from '@/state/AppState';
import { BLUR_ENABLED } from '@/site/config';
import { VideoDbUpd } from '@/db/video_orm';
import ImageWithFallback from '@/components/image/ImageWithFallback';
import clsx from 'clsx';
import Spinner from '@/components/Spinner';
import ErrorNote from '@/components/ErrorNote';
import { createVideoAction, updateVideoAction } from '../actions';
import FieldSetWithStatus from '@/components/FieldSetWithStatus';
import Link from 'next/link';
import { PATH_ADMIN_VIDEO_UPLOADS, PATH_ADMIN_VIDEOS } from '@/site/paths';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';

const THUMBNAIL_SIZE = 300;

export default function VideoForm({
  type = 'create',
  initialPhotoForm,
  updatedExifData,
  updatedBlurData,
  uniqueTags,
  onTitleChange,
  onTextContentChange,
  onFormStatusChange,
}: {
  type?: 'create' | 'edit';
  initialPhotoForm: Partial<VideoFormData>;
  updatedExifData?: Partial<VideoFormData>;
  updatedBlurData?: string;
  uniqueTags?: Tags;
  shouldStripGpsData?: boolean;
  onTitleChange?: (updatedTitle: string) => void;
  onTextContentChange?: (hasContent: boolean) => void;
  onFormStatusChange?: (pending: boolean) => void;
}) {
  const [formData, setFormData] = useState<Partial<VideoFormData>>(initialPhotoForm);
  const [formErrors, setFormErrors] = useState(getFormErrors(initialPhotoForm));
  const [formActionErrorMessage, setFormActionErrorMessage] = useState('');

  const { invalidateSwr, shouldDebugImageFallbacks } = useAppState();

  const changedFormKeys = useMemo(
    () => getChangedFormFields(initialPhotoForm, formData),
    [initialPhotoForm, formData],
  );
  const formHasChanged = changedFormKeys.length > 0;

  usePreventNavigation(formHasChanged);

  const canFormBeSubmitted = (type === 'create' || formHasChanged) && isFormValid(formData);

  const { width, height } = getDimensionsFromSize(THUMBNAIL_SIZE);

  const url = formData.url ?? '';

  useEffect(() => {
    if (updatedBlurData) {
      setFormData(data => (updatedBlurData ? { ...data, blurData: updatedBlurData } : data));
    } else if (!BLUR_ENABLED) {
      setFormData(data => ({ ...data, blurData: '' }));
    }
  }, [updatedBlurData]);

  useEffect(() => {
    onTextContentChange?.(formHasTextContent(formData));
  }, [onTextContentChange, formData]);

  const shouldHideField = (
    key: keyof VideoDbUpd | 'favorite',
    hideIfEmpty?: boolean,
    shouldHide?: (formData: Partial<VideoFormData>) => boolean,
  ) => {
    return (hideIfEmpty && !formData[key]) || shouldHide?.(formData);
  };

  return (
    <div className="relative max-w-[38rem] space-y-8">
      <div className="flex gap-2">
        <div className="relative">
          <ImageWithFallback
            alt="Upload"
            src={url}
            className={clsx(
              'overflow-hidden rounded-md border',
              'border-gray-200 dark:border-gray-700',
            )}
            width={width}
            height={height}
            priority
          />
          <div className={clsx('absolute left-2 top-2 opacity-0 transition-opacity duration-500')}>
            <div
              className={clsx(
                'text-xs font-medium uppercase leading-none tracking-wide',
                'rounded-[4px] px-1.5 py-1',
                'inline-flex items-center gap-2',
                'bg-white/70 backdrop-blur-md dark:bg-black/60',
                'border border-gray-900/10 dark:border-gray-700/70',
                'select-none',
              )}
            >
              <Spinner
                color="text"
                size={9}
                className={clsx('text-extra-dim', 'translate-x-[1px] translate-y-[0.5px]')}
              />
              Analyzing image
            </div>
          </div>
        </div>
      </div>
      {formActionErrorMessage && <ErrorNote>{formActionErrorMessage}</ErrorNote>}
      <form
        action={data =>
          (type === 'create' ? createVideoAction : updateVideoAction)(data).catch(e =>
            setFormActionErrorMessage(e.message),
          )
        }
        onSubmit={() => {
          setFormActionErrorMessage('');
          (document.activeElement as HTMLElement)?.blur?.();
        }}
      >
        {/* Fields */}
        <div className="space-y-6">
          {FORM_METADATA_ENTRIES(convertTagsForForm(uniqueTags), false).map(
            ([
              key,
              {
                label,
                note,
                required,
                selectOptions,
                selectOptionsDefaultLabel,
                tagOptions,
                readOnly,
                validate,
                validateStringMaxLength,
                capitalize,
                hideIfEmpty,
                shouldHide,
                loadingMessage,
                type,
              },
            ]) =>
              !shouldHideField(key, hideIfEmpty, shouldHide) && (
                <FieldSetWithStatus
                  key={key}
                  id={key}
                  label={label}
                  note={note}
                  error={formErrors[key]}
                  value={formData[key] ?? ''}
                  isModified={changedFormKeys.includes(key)}
                  onChange={value => {
                    const formUpdated = { ...formData, [key]: value };
                    setFormData(formUpdated);
                    if (validate) {
                      setFormErrors({ ...formErrors, [key]: validate(value) });
                    } else if (validateStringMaxLength !== undefined) {
                      setFormErrors({
                        ...formErrors,
                        [key]:
                          value.length > validateStringMaxLength
                            ? `${validateStringMaxLength} characters or less`
                            : undefined,
                      });
                    }
                    if (key === 'title') {
                      onTitleChange?.(value.trim());
                    }
                  }}
                  selectOptions={selectOptions}
                  selectOptionsDefaultLabel={selectOptionsDefaultLabel}
                  tagOptions={tagOptions}
                  required={required}
                  readOnly={readOnly}
                  capitalize={capitalize}
                  placeholder={loadingMessage && !formData[key] ? loadingMessage : undefined}
                  loading={loadingMessage && !formData[key] ? true : false}
                  type={type}
                />
              ),
          )}
        </div>
        {/* Actions */}
        <div className={clsx('sticky bottom-0 flex gap-3', 'mt-12 pb-4 md:pb-8')}>
          <Link
            className="button"
            href={type === 'edit' ? PATH_ADMIN_VIDEOS : PATH_ADMIN_VIDEO_UPLOADS}
          >
            Cancel
          </Link>
          <SubmitButtonWithStatus
            disabled={!canFormBeSubmitted}
            onFormStatusChange={onFormStatusChange}
            onFormSubmit={invalidateSwr}
            primary
          >
            {type === 'create' ? 'Create' : 'Update'}
          </SubmitButtonWithStatus>
          <div
            className={clsx(
              'absolute -left-2 -top-16 bottom-0 right-0 -z-10',
              'pointer-events-none',
              'bg-gradient-to-t',
              'from-white/90 from-60%',
              'dark:from-black/90 dark:from-50%',
            )}
          />
        </div>
      </form>
    </div>
  );
}
