import { getVideosMeta } from '@/db/video_orm';
import { INFINITE_SCROLL_GRID_INITIAL, INFINITE_SCROLL_GRID_MULTIPLE } from '@/photo';
import StaggeredOgImages from '@/app/og/StaggeredOgImages';
import StaggeredOgPhotosInfinite from '@/app/og/StaggeredOgImagesInfinite';
import { getVideosCached } from '@/video/cache';

export default async function OGPage() {
  const [media, count] = await Promise.all([
    getVideosCached({ limit: INFINITE_SCROLL_GRID_INITIAL }).catch(() => []),
    getVideosMeta({})
      .then(({ count }) => count)
      .catch(() => 0),
  ]);

  return (
    <>
      <StaggeredOgImages {...{ photos: media }} />
      {count > media.length && (
        <div className="mt-3">
          <StaggeredOgPhotosInfinite
            initialOffset={media.length}
            itemsPerPage={INFINITE_SCROLL_GRID_MULTIPLE}
          />
        </div>
      )}
    </>
  );
}
