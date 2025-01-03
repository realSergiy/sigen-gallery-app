import { clsx } from 'clsx/lite';
import { ReactNode } from 'react';

export default function AdminTable({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <div className="font-bold">{title}</div>}
      {/* py-[1px] fixes Safari vertical scroll bug */}
      <div className="min-w-56 overflow-x-auto py-px">
        <div
          className={clsx(
            'w-full',
            'grid grid-cols-[auto_1fr_auto]',
            'items-center gap-2 sm:gap-3',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
