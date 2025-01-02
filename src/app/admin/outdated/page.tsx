import { getPhotos } from '@/photo/db/query';
import AdminOutdatedClient from '@/admin/AdminOutdatedClient';
import { AI_TEXT_GENERATION_ENABLED } from '@/site/config';
import { OUTDATED_THRESHOLD } from '@/media';

export const maxDuration = 60;

export default async function AdminOutdatedPage() {
  const photos = await getPhotos({
    hidden: 'include',
    sortBy: 'createdAtAsc',
    updatedBefore: OUTDATED_THRESHOLD,
    limit: 1_000,
  }).catch(() => []);

  return (
    <AdminOutdatedClient
      {...{
        photos,
        hasAiTextGeneration: AI_TEXT_GENERATION_ENABLED,
      }}
    />
  );
}
