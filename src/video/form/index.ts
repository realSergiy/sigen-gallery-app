import { Video, VideoDbNew, VideoDbUpd } from '@/db/video_orm';
import {
  dateFromTimestamp,
  generateLocalNaivePostgresString,
  generateLocalPostgresString,
} from '@/utility/date';
import { convertStringToArray } from '@/utility/string';
import { generateNanoid } from '@/utility/nanoid';
import { FilmSimulation } from '@/simulation';
import { TAG_FAVS, getValidationMessageForTags } from '@/tag';

export type FieldSetType = 'text' | 'email' | 'password' | 'checkbox' | 'textarea';

export type AnnotatedTag = {
  value: string;
  annotation?: string;
  annotationAria?: string;
};

type FormMeta = {
  label: string;
  note?: string;
  required?: boolean;
  excludeFromInsert?: boolean;
  readOnly?: boolean;
  validate?: (value?: string) => string | undefined;
  validateStringMaxLength?: number;
  capitalize?: boolean;
  hide?: boolean;
  hideIfEmpty?: boolean;
  shouldHide?: (formData: Partial<VideoFormData>) => boolean;
  loadingMessage?: string;
  type?: FieldSetType;
  selectOptions?: { value: string; label: string }[];
  selectOptionsDefaultLabel?: string;
  tagOptions?: AnnotatedTag[];
};

const STRING_MAX_LENGTH_SHORT = 255;
const STRING_MAX_LENGTH_LONG = 1000;

type VirtualFields = 'favorite';
export type VideoFormData = Record<keyof VideoDbNew | VirtualFields, string>;

const FORM_METADATA = (
  tagOptions?: AnnotatedTag[],
  aiTextGeneration?: boolean,
): Record<keyof VideoFormData, FormMeta> => ({
  title: {
    label: 'title',
    capitalize: true,
    validateStringMaxLength: STRING_MAX_LENGTH_SHORT,
  },
  caption: {
    label: 'caption',
    capitalize: true,
    validateStringMaxLength: STRING_MAX_LENGTH_LONG,
    shouldHide: ({ title, caption }) => !aiTextGeneration && !title && !caption,
  },
  tags: {
    label: 'tags',
    tagOptions,
    validate: getValidationMessageForTags,
  },
  id: { label: 'id', readOnly: true, hideIfEmpty: true },
  url: { label: 'url', readOnly: true },
  thumbnailUrl: { label: 'thumbnail', readOnly: true },
  extension: { label: 'extension', readOnly: true },
  locationName: { label: 'location name', hide: true },
  takenAt: { label: 'taken at' },
  favorite: { label: 'favorite', type: 'checkbox', excludeFromInsert: true },
  hidden: { label: 'hidden', type: 'checkbox' },
});

export const FORM_METADATA_ENTRIES = (...args: Parameters<typeof FORM_METADATA>) =>
  (Object.entries(FORM_METADATA(...args)) as [keyof VideoFormData, FormMeta][]).filter(
    ([_, meta]) => !meta.hide,
  );

export const convertFormKeysToLabels = (keys: (keyof VideoFormData)[]) =>
  keys.map(key => FORM_METADATA()[key].label.toUpperCase());

export const getFormErrors = (
  formData: Partial<VideoFormData>,
): Partial<Record<keyof VideoFormData, string>> =>
  Object.keys(formData).reduce(
    (acc, key) => ({
      ...acc,
      [key]: FORM_METADATA_ENTRIES()
        .find(([k]) => k === key)?.[1]
        .validate?.(formData[key as keyof VideoFormData]),
    }),
    {},
  );

export const isFormValid = (formData: Partial<VideoFormData>) =>
  FORM_METADATA_ENTRIES().every(
    ([key, { required, validate, validateStringMaxLength }]) =>
      (!required || Boolean(formData[key])) &&
      !validate?.(formData[key]) &&
      // eslint-disable-next-line max-len
      (!validateStringMaxLength || (formData[key]?.length ?? 0) <= validateStringMaxLength),
  );

export const formHasTextContent = ({ title, caption, tags }: Partial<VideoFormData>) =>
  Boolean(title || caption || tags);

// CREATE FORM DATA: FROM PHOTO

export const convertVideoToFormData = (video: Video): VideoFormData => {
  const valueForKey = (key: keyof Video, value: any) => {
    switch (key) {
      case 'tags':
        return (value ?? []).filter((tag: string) => tag !== TAG_FAVS).join(', ');
      case 'takenAt':
        return value?.toISOString ? value.toISOString() : value;
      case 'hidden':
        return value ? 'true' : 'false';
      default:
        return value !== undefined && value !== null ? value.toString() : undefined;
    }
  };
  return Object.entries(video).reduce(
    (videoForm, [key, value]) => ({
      ...videoForm,
      [key]: valueForKey(key as keyof Video, value),
    }),
    {
      favorite: video.tags.includes(TAG_FAVS) ? 'true' : 'false',
    } as VideoFormData,
  );
};

// PREPARE FORM FOR DB INSERT

export const convertFormDataToVideoDbInsert = (
  formData: FormData | Partial<VideoFormData>,
): VideoDbUpd => {
  const videoForm =
    formData instanceof FormData ? (Object.fromEntries(formData) as VideoFormData) : formData;

  const tags = convertStringToArray(videoForm.tags) ?? [];
  if (videoForm.favorite === 'true') {
    tags.push(TAG_FAVS);
  }

  const locationName = videoForm.locationName || '';

  // Parse FormData:
  // - remove server action ID
  // - remove empty strings
  Object.keys(videoForm).forEach(key => {
    const meta = FORM_METADATA()[key as keyof VideoFormData];
    if (
      key.startsWith('$ACTION_ID_') ||
      (videoForm as any)[key] === '' ||
      meta?.excludeFromInsert
    ) {
      delete (videoForm as any)[key];
    }
  });

  return {
    ...(videoForm as VideoFormData & { filmSimulation?: FilmSimulation }),
    ...(!videoForm.id && { id: generateNanoid() }),
    // Convert form strings to arrays
    tags: tags.length > 0 ? tags : [],
    hidden: videoForm.hidden === 'true',
    locationName,
    ...generateTakenAtFields(videoForm),
  };
};

export const getChangedFormFields = (
  original: Partial<VideoFormData>,
  current: Partial<VideoFormData>,
) => {
  return Object.keys(current).filter(
    key =>
      (original[key as keyof VideoFormData] ?? '') !== (current[key as keyof VideoFormData] ?? ''),
  ) as (keyof VideoFormData)[];
};

export const generateTakenAtFields = (form?: Partial<VideoFormData>): { takenAt: Date } => ({
  takenAt: dateFromTimestamp(form?.takenAt),
});