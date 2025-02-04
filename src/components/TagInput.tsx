import { AnnotatedTag } from '@/photo/form';
import { convertStringToArray, parameterize } from '@/utility/string';
import { clsx } from 'clsx/lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const KEY_KEYDOWN = 'keydown';
const CREATE_LABEL = 'Create';

const ARIA_ID_TAG_CONTROL = 'tag-control';
const ARIA_ID_TAG_OPTIONS = 'tag-options';

export default function TagInput({
  id,
  name,
  value = '',
  options = [],
  onChange,
  className,
  readOnly,
  placeholder,
}: {
  id?: string;
  name: string;
  value?: string;
  options?: AnnotatedTag[];
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const containerRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLInputElement>(null);

  const [shouldShowMenu, setShouldShowMenu] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>();

  const optionValues = useMemo(() => options.map(({ value }) => value), [options]);

  const selectedOptions = useMemo(() => convertStringToArray(value) ?? [], [value]);

  const inputTextFormatted = parameterize(inputText);
  const isInputTextUnique =
    inputTextFormatted &&
    !optionValues.includes(inputTextFormatted) &&
    !selectedOptions.includes(inputTextFormatted);

  const optionsFiltered = useMemo<AnnotatedTag[]>(
    () =>
      (isInputTextUnique ? [{ value: `${CREATE_LABEL} "${inputTextFormatted}"` }] : []).concat(
        options.filter(
          ({ value }) =>
            !selectedOptions.includes(value) &&
            (!inputTextFormatted || value.includes(inputTextFormatted)),
        ),
      ),
    [inputTextFormatted, isInputTextUnique, options, selectedOptions],
  );

  const hideMenu = useCallback((shouldBlurInput?: boolean) => {
    setShouldShowMenu(false);
    setSelectedOptionIndex(undefined);
    if (shouldBlurInput) {
      inputRef.current?.blur();
    }
  }, []);

  const addOptions = useCallback(
    (options: (string | undefined)[]) => {
      const optionsToAdd = (options.filter(Boolean) as string[])
        .map(option =>
          option.startsWith(CREATE_LABEL)
            ? (option.match(new RegExp(`^${CREATE_LABEL} "(.+)"$`))?.[1] ?? option)
            : option,
        )
        .map(option => parameterize(option))
        .filter(option => !selectedOptions.includes(option));

      if (optionsToAdd.length > 0) {
        onChange?.([...selectedOptions, ...optionsToAdd].join(','));
      }

      setSelectedOptionIndex(undefined);
      inputRef.current?.focus();
    },
    [onChange, selectedOptions],
  );

  const removeOption = useCallback(
    (option: string) => {
      onChange?.(selectedOptions.filter(o => o !== parameterize(option)).join(','));
      setSelectedOptionIndex(undefined);
      inputRef.current?.focus();
    },
    [onChange, selectedOptions],
  );

  // Show options when input text changes
  useEffect(() => {
    if (inputText) {
      if (inputText.includes(',')) {
        addOptions(inputText.split(','));
        setInputText('');
      } else {
        setShouldShowMenu(true);
      }
    }
  }, [inputText, addOptions, selectedOptions]);

  // Focus option in the DOM when selected index changes
  useEffect(() => {
    if (selectedOptionIndex !== undefined) {
      const options = optionsRef.current?.querySelectorAll(':scope > div');
      const option = options?.[selectedOptionIndex] as HTMLElement | undefined;
      option?.focus();
    }
  }, [selectedOptionIndex]);

  // Setup keyboard listener
  useEffect(() => {
    const ref = containerRef.current;

    const listener = (e: KeyboardEvent) => {
      // Keys which always trap focus
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Escape':
          e.stopImmediatePropagation();
          e.preventDefault();
      }
      switch (e.key) {
        case 'Enter':
          // Only trap focus if there are options to select
          // otherwise allow form to submit
          if (shouldShowMenu && optionsFiltered.length > 0) {
            e.stopImmediatePropagation();
            e.preventDefault();
            addOptions([optionsFiltered[selectedOptionIndex ?? 0].value]);
            setInputText('');
          }
          break;
        case 'ArrowDown':
          if (shouldShowMenu) {
            setSelectedOptionIndex(index => {
              if (index === undefined) {
                return optionsFiltered.length > 1 ? 1 : 0;
              } else if (index >= optionsFiltered.length - 1) {
                return 0;
              } else {
                return index + 1;
              }
            });
          } else {
            setShouldShowMenu(true);
          }
          break;
        case 'ArrowUp':
          setSelectedOptionIndex(index => {
            if (document.activeElement === inputRef.current && optionsFiltered.length > 0) {
              return optionsFiltered.length - 1;
            } else if (index === undefined || index === 0) {
              inputRef.current?.focus();
              return;
            } else {
              return index - 1;
            }
          });
          break;
        case 'Backspace':
          if (inputText === '') {
            const lastOption = selectedOptions.at(-1);
            if (lastOption) {
              removeOption(lastOption);
              hideMenu();
            }
          }
          break;
        case 'Escape':
          hideMenu(true);
          break;
      }
    };

    ref?.addEventListener(KEY_KEYDOWN, listener);

    return () => ref?.removeEventListener(KEY_KEYDOWN, listener);
  }, [
    inputText,
    removeOption,
    hideMenu,
    selectedOptions,
    selectedOptionIndex,
    optionsFiltered,
    addOptions,
    shouldShowMenu,
  ]);

  return (
    <div
      ref={containerRef}
      className="group flex w-full flex-col"
      onFocus={() => setShouldShowMenu(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          hideMenu();
        }
      }}
    >
      <div
        id={ARIA_ID_TAG_CONTROL}
        role="region"
        aria-live="polite"
        className="text-dim sr-only mb-3"
      >
        {selectedOptions.length === 0
          ? 'No tags selected'
          : selectedOptions.join(', ') + ` tag${selectedOptions.length === 1 ? '' : 's'} selected`}
      </div>
      <div
        aria-controls={ARIA_ID_TAG_CONTROL}
        className={clsx(
          className,
          'control w-full !p-2',
          'outline-1 outline-blue-600',
          'group-focus-within:outline group-active:outline',
          'inline-flex flex-wrap items-center gap-2',
          readOnly && 'cursor-not-allowed',
          readOnly && 'bg-gray-100 dark:bg-gray-900 dark:text-gray-400',
        )}
      >
        {selectedOptions.filter(Boolean).map(option => (
          <span
            key={option}
            role="button"
            aria-label={`Remove tag "${option}"`}
            className={clsx(
              'text-main',
              'cursor-pointer select-none',
              'whitespace-nowrap',
              'px-1.5 py-0.5',
              'bg-gray-200/60 dark:bg-gray-800',
              'active:bg-gray-200 dark:active:bg-gray-900',
              'rounded-sm',
            )}
            onClick={() => removeOption(option)}
          >
            {option}
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          type="text"
          className={clsx(
            '-my-2 !min-w-0 grow !p-0 text-xl',
            '!border-none !ring-transparent',
            'placeholder:text-dim placeholder:text-[14px]',
            'placeholder:translate-x-[2px]',
            'placeholder:translate-y-[-1.5px]',
          )}
          size={10}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          readOnly={readOnly}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          onFocus={() => setSelectedOptionIndex(undefined)}
          aria-autocomplete="list"
          aria-expanded={shouldShowMenu}
          aria-haspopup="true"
          aria-controls={shouldShowMenu ? ARIA_ID_TAG_OPTIONS : undefined}
          role="combobox"
        />
        <input type="hidden" name={name} value={value} />
      </div>
      {shouldShowMenu && optionsFiltered.length > 0 && (
        <div className="relative">
          <div
            id={ARIA_ID_TAG_OPTIONS}
            role="listbox"
            ref={optionsRef}
            className={clsx(
              'control absolute top-0 z-10 mt-3 w-full !p-1.5',
              'max-h-32 overflow-y-auto',
              'flex flex-col gap-y-1',
              'text-xl shadow-lg dark:shadow-xl',
            )}
          >
            {optionsFiltered.map(({ value, annotation, annotationAria }, index) => (
              <div
                key={value}
                role="option"
                aria-selected={
                  index === selectedOptionIndex ||
                  (index === 0 && selectedOptionIndex === undefined)
                }
                tabIndex={0}
                className={clsx(
                  'text-base',
                  'group flex items-center gap-1',
                  'cursor-pointer select-none',
                  'rounded-sm px-1.5 py-1',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'active:bg-gray-50 dark:active:bg-gray-900',
                  'focus:bg-gray-100 dark:focus:bg-gray-800',
                  index === 0 &&
                    selectedOptionIndex === undefined &&
                    'bg-gray-100 dark:bg-gray-800',
                  'outline-none',
                )}
                onClick={() => {
                  addOptions([value]);
                  setInputText('');
                }}
                onFocus={() => setSelectedOptionIndex(index)}
              >
                <span className="min-w-0 grow truncate">{value}</span>
                {annotation && (
                  <span className="text-dim whitespace-nowrap text-sm" aria-label={annotationAria}>
                    <span aria-hidden={Boolean(annotationAria)}>{annotation}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
