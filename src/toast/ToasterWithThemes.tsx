'use client';

import { clsx } from 'clsx/lite';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export default function ToasterWithThemes() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme as 'system' | 'light' | 'dark'}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: clsx(
            'flex w-full items-center gap-x-1.5 p-4',
            'font-mono text-sm',
            'bg-white dark:bg-black',
            'text-gray-900 dark:text-gray-100',
            'border border-gray-200 dark:border-gray-800',
            'rounded-lg',
          ),
        },
      }}
    />
  );
}
