import { clsx } from 'clsx/lite';

import type { JSX } from 'react';
import { TestIdProps } from './types';

type SwitcherItemProps = {
  icon: JSX.Element;
  label: string;
  onClick?: () => void;
  active?: boolean;
} & TestIdProps;

export default function SwitcherItem2({ icon, label, onClick, active }: SwitcherItemProps) {
  const className = clsx(
    'px-1.5 py-0.5',
    'cursor-pointer',
    'hover:bg-gray-100/60 active:bg-gray-100',
    'dark:hover:bg-gray-900/75 dark:active:bg-gray-900',
    active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600',
    active
      ? 'hover:text-black hover:dark:text-white'
      : 'hover:text-gray-700 dark:hover:text-gray-400',
  );

  return (
    <div {...{ label, onClick, className }}>
      <div className="flex justify-items-start">
        <div className={clsx(!active && 'invisible', 'h-[24px] w-[28px]')}>{icon}</div>
        <div className={clsx('text-center text-xl')}>{label}</div>
      </div>
    </div>
  );
}
