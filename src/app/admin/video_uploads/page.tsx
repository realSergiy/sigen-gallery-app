import { getStorageVideoUploadUrlsNoStore } from '@/services/storage/cache';
import SiteGrid from '@/components/SiteGrid';
import { getUniqueTagsCached } from '@/video/cache';
import AdminVideoUploadsTable from '@/admin/AdminVideoUploadsTable';
import AdminUploadsClient from '@/admin/AdminUploadsClient';

export const maxDuration = 60;

export default async function AdminVideoUploadsPage() {
  const urls = await getStorageVideoUploadUrlsNoStore();
  const uniqueTags = await getUniqueTagsCached();
  return (
    <SiteGrid
      contentMain={
        <AdminUploadsClient
          {...{
            urls,
            uniqueTags,
            TableComponent: AdminVideoUploadsTable,
          }}
        />
      }
    />
  );
}
