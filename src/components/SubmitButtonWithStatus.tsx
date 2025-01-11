'use client';

import { ComponentProps, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { clsx } from 'clsx/lite';
import { toastSuccess } from '@/toast';
import LoaderButton from '@/components/primitives/LoaderButton';

export default function SubmitButtonWithStatus({
  icon,
  styleAs,
  spinnerColor,
  onFormStatusChange,
  onFormSubmitToastMessage,
  onFormSubmit,
  children,
  disabled,
  className,
  ...buttonProps
}: {
  onFormStatusChange?: (pending: boolean) => void;
  onFormSubmitToastMessage?: string;
  onFormSubmit?: () => void;
} & ComponentProps<typeof LoaderButton>) {
  const { pending } = useFormStatus();

  const pendingPrevious = useRef(pending);

  useEffect(() => {
    // calling toasts or external functions should be wrapped into useEffect
    if (pending !== pendingPrevious.current) {
      if (pendingPrevious.current && !pending) {
        if (onFormSubmitToastMessage) {
          toastSuccess(onFormSubmitToastMessage);
        }
        onFormSubmit?.();
      }

      onFormStatusChange?.(pending);
      pendingPrevious.current = pending;
    }
  }, [pending, onFormStatusChange, onFormSubmitToastMessage, onFormSubmit]);

  return (
    <LoaderButton
      {...buttonProps}
      type="submit"
      disabled={disabled}
      className={clsx('inline-flex items-center gap-2', className)}
      icon={icon}
      spinnerColor={spinnerColor}
      styleAs={styleAs}
      isLoading={pending}
    >
      {children}
    </LoaderButton>
  );
}
