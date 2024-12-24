import { getStorageVideoUploadUrlsNoStore } from '@/services/storage/cache';
import SiteGrid from '@/components/SiteGrid';
import AdminVideoUploadsClient from '@/admin/AdminVideoUploadsClient';
import { getUniqueTagsCached } from '@/video/cache';

export const maxDuration = 60;

export default async function AdminVideoUploadsPage() {
  const urls = await getStorageVideoUploadUrlsNoStore();
  const uniqueTags = await getUniqueTagsCached();
  return (
    <SiteGrid
      contentMain={
        <AdminVideoUploadsClient
          {...{
            urls,
            uniqueTags,
          }}
        />
      }
    />
  );
}
