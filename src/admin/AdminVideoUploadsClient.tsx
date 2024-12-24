'use client';

import { StorageListResponse } from '@/services/storage';
import AdminAddAllUploads from './AdminAddAllUploads';
import { useMemo, useState } from 'react';
import { Tags } from '@/tag';
import AdminVideoUploadsTable from './AdminVideoUploadsTable';

export type UrlAddStatus = {
  url: string;
  uploadedAt?: Date;
  status?: 'waiting' | 'adding' | 'added';
  statusMessage?: string;
  progress?: number;
};

export default function AdminVideoUploadsClient({
  urls,
  uniqueTags,
}: {
  urls: StorageListResponse;
  uniqueTags?: Tags;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [urlAddStatuses, setUrlAddStatuses] = useState<UrlAddStatus[]>(urls);

  const storageUrls = useMemo(() => urls.map(({ url }) => url), [urls]);

  return (
    <div className="space-y-4">
      {(urls.length > 1 || isAdding) && (
        <AdminAddAllUploads
          {...{
            storageUrls,
            uniqueTags,
            isAdding,
            setIsAdding,
            setUrlAddStatuses,
          }}
        />
      )}
      <AdminVideoUploadsTable {...{ isAdding, urlAddStatuses, setUrlAddStatuses }} />
    </div>
  );
}
