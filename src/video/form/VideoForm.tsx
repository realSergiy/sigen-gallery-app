'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FORM_METADATA_ENTRIES,
  VideoFormData,
  convertFormKeysToLabels,
  formHasTextContent,
  getChangedFormFields,
  getFormErrors,
  isFormValid,
} from '.';
import FieldSetWithStatus from '@/components/FieldSetWithStatus';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import { PATH_ADMIN_VIDEOS, PATH_ADMIN_VIDEO_UPLOADS } from '@/site/paths';
import { toastSuccess, toastWarning } from '@/toast';
import { getDimensionsFromSize } from '@/utility/size';
import ImageWithFallback from '@/components/image/ImageWithFallback';
import { Tags, convertTagsForForm } from '@/tag';
import Spinner from '@/components/Spinner';
import usePreventNavigation from '@/utility/usePreventNavigation';
import { useAppState } from '@/state/AppState';
import { BLUR_ENABLED } from '@/site/config';
import ErrorNote from '@/components/ErrorNote';

const THUMBNAIL_SIZE = 300;

export default function VideoForm({
  type = 'create',
  initialPhotoForm,
  updatedExifData,
  updatedBlurData,
  uniqueTags,
  shouldStripGpsData,
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
  const [formData, setFormData] =
    useState<Partial<VideoFormData>>(initialPhotoForm);
  const [formErrors, setFormErrors] = useState(getFormErrors(initialPhotoForm));
  const [formActionErrorMessage, setFormActionErrorMessage] = useState('');

  const { invalidateSwr, shouldDebugImageFallbacks } = useAppState();

  const changedFormKeys = useMemo(
    () => getChangedFormFields(initialPhotoForm, formData),
    [initialPhotoForm, formData],
  );
  const formHasChanged = changedFormKeys.length > 0;
  const onlyChangedFieldIsBlurData =
    changedFormKeys.length === 1 && changedFormKeys[0] === 'blurData';

  usePreventNavigation(formHasChanged && !onlyChangedFieldIsBlurData);

  const canFormBeSubmitted =
    (type === 'create' || formHasChanged) && isFormValid(formData);

  // Update form when EXIF data
  // is refreshed by parent
  useEffect(() => {
    if (Object.keys(updatedExifData ?? {}).length > 0) {
      const changedKeys: (keyof VideoFormData)[] = [];

      setFormData(currentForm => {
        Object.entries(updatedExifData ?? {}).forEach(([key, value]) => {
          if (currentForm[key as keyof VideoFormData] !== value) {
            changedKeys.push(key as keyof VideoFormData);
          }
        });

        return {
          ...currentForm,
          ...updatedExifData,
        };
      });

      if (changedKeys.length > 0) {
        const fields = convertFormKeysToLabels(changedKeys);
        toastSuccess(`Updated EXIF fields: ${fields.join(', ')}`, 8000);
      } else {
        toastWarning('No new EXIF data found');
      }
    }
  }, [updatedExifData]);

  const { width, height } = getDimensionsFromSize(
    THUMBNAIL_SIZE,
    formData.aspectRatio,
  );

  const url = formData.url ?? '';

  useEffect(() => {
    if (updatedBlurData) {
      setFormData(data =>
        updatedBlurData ? { ...data, blurData: updatedBlurData } : data,
      );
    } else if (!BLUR_ENABLED) {
      setFormData(data => ({ ...data, blurData: '' }));
    }
  }, [updatedBlurData]);

  useEffect(() => {
    onTextContentChange?.(formHasTextContent(formData));
  }, [onTextContentChange, formData]);

  const shouldHideField = (
    key: keyof PhotoDbInsert | 'favorite',
    hideIfEmpty?: boolean,
    shouldHide?: (formData: Partial<PhotoFormData>) => boolean,
  ) => {
    if (
      key === 'blurData' &&
      type === 'create' &&
      !BLUR_ENABLED &&
      !shouldDebugImageFallbacks
    ) {
      return true;
    } else {
      return (hideIfEmpty && !formData[key]) || shouldHide?.(formData);
    }
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
            blurDataURL={formData.blurData}
            blurCompatibilityLevel="none"
            width={width}
            height={height}
            priority
          />
          <div
            className={clsx(
              'absolute left-2 top-2 opacity-0 transition-opacity duration-500',
            )}
          >
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
                className={clsx(
                  'text-extra-dim',
                  'translate-x-[1px] translate-y-[0.5px]',
                )}
              />
              Analyzing image
            </div>
          </div>
        </div>
      </div>
      {formActionErrorMessage && (
        <ErrorNote>{formActionErrorMessage}</ErrorNote>
      )}
      <form
        action={data =>
          (type === 'create' ? createPhotoAction : updatePhotoAction)(
            data,
          ).catch(e => setFormActionErrorMessage(e.message))
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
                  label={
                    label +
                    (key === 'blurData' && shouldDebugImageFallbacks
                      ? ` (${(formData[key] ?? '').length} chars.)`
                      : '')
                  }
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
                  placeholder={
                    loadingMessage && !formData[key]
                      ? loadingMessage
                      : undefined
                  }
                  loading={loadingMessage && !formData[key] ? true : false}
                  type={type}
                />
              ),
          )}
          <input
            type="hidden"
            name="shouldStripGpsData"
            value={shouldStripGpsData ? 'true' : 'false'}
            readOnly
          />
        </div>
        {/* Actions */}
        <div
          className={clsx('sticky bottom-0 flex gap-3', 'mt-12 pb-4 md:pb-8')}
        >
          <Link
            className="button"
            href={
              type === 'edit' ? PATH_ADMIN_PHOTOS : PATH_ADMIN_PHOTO_UPLOADS
            }
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
