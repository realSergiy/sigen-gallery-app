import { ReactNode } from 'react';
import { clsx } from 'clsx/lite';

type SwitcherProps = {
  children: ReactNode;
  type?: 'regular' | 'borderless';
  direction?: 'horizontal' | 'vertical';
};

export default function Switcher({
  children,
  type = 'regular',
  direction = 'horizontal',
}: SwitcherProps) {
  return (
    <div
      className={clsx(
        'flex divide-gray-300 overflow-hidden rounded-md border dark:divide-gray-800',
        direction === 'horizontal' ? 'divide-x' : 'flex-col',
        type === 'regular'
          ? 'border-gray-300 shadow-sm dark:border-gray-800'
          : 'border-transparent',
      )}
    >
      {children}
    </div>
  );
}
