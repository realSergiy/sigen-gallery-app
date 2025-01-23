import { getStoragePhotoUploadUrlsNoStore } from '@/services/storage/cache';
import SiteGrid from '@/components/SiteGrid';
import { getUniqueTagsCached } from '@/photo/cache';
import AdminUploadsClient from '@/admin/AdminUploadsClient';
import AdminUploadsTable from '@/admin/AdminUploadsTable';

export const maxDuration = 60;

export default async function AdminUploadsPage() {
  const urls = await getStoragePhotoUploadUrlsNoStore();
  const uniqueTags = await getUniqueTagsCached();
  return (
    <SiteGrid
      contentMain={
        <AdminUploadsClient
          {...{
            urls,
            uniqueTags,
            TableComponent: AdminUploadsTable,
          }}
        />
      }
    />
  );
}
