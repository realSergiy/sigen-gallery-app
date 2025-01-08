'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx/lite';
import { ReactNode, useState, useTransition } from 'react';
import LoaderButton from '../primitives/LoaderButton';
import { usePathname, useRouter } from 'next/navigation';
import { downloadFileFromBrowser } from '@/utility/url';

export default function MoreMenuItem({
  label,
  icon,
  href,
  hrefDownloadName,
  action,
  shouldPreventDefault = true,
}: {
  label: string;
  icon?: ReactNode;
  href?: string;
  hrefDownloadName?: string;
  action?: () => Promise<unknown>;
  shouldPreventDefault?: boolean;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  return (
    <DropdownMenu.Item
      disabled={isLoading}
      className={clsx(
        'flex h-8 items-center',
        'rounded-[3px] px-2 py-1.5',
        'select-none hover:outline-none',
        'hover:bg-gray-50 active:bg-gray-100',
        'hover:dark:bg-gray-900/75 active:dark:bg-gray-900',
        'whitespace-nowrap',
        isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
      onClick={async e => {
        if (shouldPreventDefault) {
          e.preventDefault();
        }
        if (action) {
          const result = action();
          if (result instanceof Promise) {
            setIsLoading(true);
            await result.finally(() => setIsLoading(false));
          }
        }
        if (href && href !== pathname) {
          if (hrefDownloadName) {
            setIsLoading(true);
            downloadFileFromBrowser(href, hrefDownloadName).finally(() => setIsLoading(false));
          } else {
            startTransition(() => router.push(href));
          }
        }
      }}
    >
      <LoaderButton
        icon={icon}
        isLoading={isLoading || isPending}
        hideTextOnMobile={false}
        styleAs="link-without-hover"
        className="translate-y-px"
      >
        {label}
      </LoaderButton>
    </DropdownMenu.Item>
  );
}
