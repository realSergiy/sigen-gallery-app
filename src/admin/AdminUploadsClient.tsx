'use client';

import { useMemo, useState } from 'react';
import AdminAddAllUploads from './AdminAddAllUploads';
import { type Tags } from '@/tag';

export type HasUrl = { url: string };

export type UrlAddStatus = {
  url: string;
  uploadedAt?: Date;
  status?: 'waiting' | 'adding' | 'added';
  statusMessage?: string;
  progress?: number;
};

type AdminUploadsClientProps<T extends HasUrl> = {
  urls: T[];
  uniqueTags?: Tags;
  TableComponent: React.ComponentType<{
    isAdding: boolean;
    urlAddStatuses: UrlAddStatus[];
    setUrlAddStatuses: React.Dispatch<React.SetStateAction<UrlAddStatus[]>>;
  }>;
};

export default function AdminUploadsClient<T extends HasUrl>({
  urls,
  uniqueTags,
  TableComponent,
}: AdminUploadsClientProps<T>) {
  const [isAdding, setIsAdding] = useState(false);
  const [urlAddStatuses, setUrlAddStatuses] = useState<UrlAddStatus[]>(urls);
  const uploadUrls = useMemo(() => urls.map(item => item.url), [urls]);

  return (
    <div className="space-y-4">
      {(urls.length > 1 || isAdding) && (
        <AdminAddAllUploads
          uploadUrls={uploadUrls}
          uniqueTags={uniqueTags}
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          setUrlAddStatuses={setUrlAddStatuses}
        />
      )}
      <TableComponent
        isAdding={isAdding}
        urlAddStatuses={urlAddStatuses}
        setUrlAddStatuses={setUrlAddStatuses}
      />
    </div>
  );
}
