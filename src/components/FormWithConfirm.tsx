'use client';

import { useAppState } from '@/state/AppState';
import clsx from 'clsx';
import { ReactNode, useCallback } from 'react';
import { BiTrash } from 'react-icons/bi';
import SubmitButtonWithStatus from './SubmitButtonWithStatus';

export default function FormWithConfirm({
  action,
  confirmText,
  onSubmit,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  confirmText?: string;
  onSubmit?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const { invalidateSwr, registerAdminUpdate } = useAppState();

  const onFormSubmit = useCallback(() => {
    invalidateSwr?.();
    registerAdminUpdate?.();
  }, [invalidateSwr, registerAdminUpdate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirmText || confirm(confirmText)) {
      e.currentTarget.requestSubmit();
      onSubmit?.();
    } else {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
      <SubmitButtonWithStatus
        title="Delete"
        icon={<BiTrash size={16} />}
        spinnerColor="text"
        className={clsx(
          '!border-red-200 !text-red-500 hover:!border-red-300 active:!bg-red-100/50 disabled:!bg-red-100/50',
          'dark:!border-red-900/75 dark:!text-red-600 dark:hover:!border-red-900 dark:active:!bg-red-950/50 dark:disabled:!bg-red-950/50',
        )}
        onFormSubmit={onFormSubmit}
      />
    </form>
  );
}
