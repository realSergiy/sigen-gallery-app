'use client';

import Spinner, { type SpinnerColor } from '@/components/Spinner';
import { clsx } from 'clsx/lite';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export default function LoaderButton(
  props: {
    isLoading?: boolean;
    icon?: ReactNode;
    spinnerColor?: SpinnerColor;
    styleAs?: 'button' | 'link' | 'link-without-hover';
    hideTextOnMobile?: boolean;
    confirmText?: string;
    shouldPreventDefault?: boolean;
    primary?: boolean;
  } & ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const {
    children,
    isLoading,
    icon,
    spinnerColor,
    styleAs = 'button',
    hideTextOnMobile = true,
    confirmText,
    shouldPreventDefault,
    primary,
    type = 'button',
    onClick,
    disabled,
    className,
    ...rest
  } = props;

  return (
    <button
      {...rest}
      type={type}
      onClick={err => {
        if (shouldPreventDefault) {
          err.preventDefault();
        }
        if (!confirmText || confirm(confirmText)) {
          onClick?.(err);
        }
      }}
      className={clsx(
        ...(styleAs === 'button'
          ? ['h-9']
          : ['link active:text-medium h-4', 'disabled:!bg-transparent']),
        styleAs === 'link' && 'hover:text-dim',
        styleAs === 'link-without-hover' && 'hover:text-main',
        'inline-flex items-center gap-2 self-start whitespace-nowrap',
        primary && 'primary',
        className,
      )}
      disabled={isLoading || disabled}
    >
      {(icon || isLoading) && (
        <span
          className={clsx(
            'inline-flex max-h-5 min-w-5 shrink-0 justify-center overflow-hidden',
            styleAs === 'button' ? 'translate-y-[-0.5px]' : 'translate-y-[0.5px]',
          )}
        >
          {isLoading ? (
            <Spinner size={14} color={spinnerColor} className="translate-y-[0.5px]" />
          ) : (
            icon
          )}
        </span>
      )}
      {children && (
        <span
          className={clsx(
            styleAs !== 'button' && isLoading && 'text-dim',
            hideTextOnMobile && icon !== undefined && 'hidden sm:inline-block',
          )}
        >
          {children}
        </span>
      )}
    </button>
  );
}
