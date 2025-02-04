import { ReactNode } from 'react';
import SiteGrid from './SiteGrid';
import { clsx } from 'clsx/lite';
import { PATH_ROOT } from '@/site/paths';
import Link from 'next/link';

export default function HttpStatusPage({
  status,
  children,
}: {
  status: number;
  children?: ReactNode;
}) {
  return (
    <SiteGrid
      contentMain={
        <div
          className={clsx(
            'min-h-72 sm:min-h-96',
            'flex flex-col items-center justify-center gap-3',
          )}
        >
          <h1
            className={clsx(
              'text-[100px] leading-none sm:text-[120px]',
              'text-gray-800 dark:text-gray-200',
            )}
          >
            {status}
          </h1>
          <div className="text-dim flex flex-col gap-6 text-center">
            {children && <div className="pt-1">{children}</div>}
            <Link href={PATH_ROOT} className="text-main">
              Return Home
            </Link>
          </div>
        </div>
      }
    />
  );
}
