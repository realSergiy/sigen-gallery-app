'use client';

import { ComponentProps } from 'react';
import LoaderButton from './LoaderButton';
import { clsx } from 'clsx/lite';

export default function ProgressButton({
  progress,
  isLoading,
  className,
  children,
  ...props
}: {
  progress?: number;
} & ComponentProps<typeof LoaderButton>) {
  return (
    <LoaderButton
      {...props}
      isLoading={isLoading ?? (progress ?? 1) < 1}
      className={clsx('relative justify-center overflow-hidden', className)}
    >
      <div
        style={{ transform: `scaleX(${progress ?? 0})` }}
        className={clsx(
          'absolute left-0 top-0 w-full',
          'origin-left transition-all duration-500',
          'bg-invert h-[2px]',
          progress === undefined ? 'opacity-0' : 'opacity-100',
        )}
      />
      {children}
    </LoaderButton>
  );
}
