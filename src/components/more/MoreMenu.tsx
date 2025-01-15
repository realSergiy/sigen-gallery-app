import { ComponentProps } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx/lite';
import { FiMoreHorizontal } from 'react-icons/fi';
import MoreMenuItem from './MoreMenuItem';

export default function MoreMenu({
  items,
  className,
  buttonClassName,
  ariaLabel,
}: {
  items: ComponentProps<typeof MoreMenuItem>[];
  className?: string;
  buttonClassName?: string;
  ariaLabel: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            buttonClassName,
            'text-dim min-h-0 border-none p-1 shadow-none',
            'hover:bg-gray-100 hover:outline-none active:bg-gray-100 hover:dark:bg-gray-800/75 active:dark:bg-gray-900',
          )}
          aria-label={ariaLabel}
        >
          <FiMoreHorizontal size={18} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className={clsx(
            'bg-content z-10 ml-2.5 min-w-32 rounded-md border p-1 shadow-lg dark:shadow-xl',
            className,
          )}
        >
          {items.map(item => (
            <MoreMenuItem key={item.label} {...item} />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
