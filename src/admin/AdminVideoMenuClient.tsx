'use client';

import { ComponentProps, useMemo } from 'react';
import { pathForAdminVideoEdit, pathForVideo } from '@/site/paths';
import { deleteVideoAction, toggleFavoriteVideoAction } from '@/video/serverFunctions';
import { FaRegEdit, FaRegStar, FaStar } from 'react-icons/fa';
import { deleteConfirmationTextForVideo, downloadFileNameForVideo } from '@/video';
import { isPathFavs, isVideoFav } from '@/tag';
import { usePathname } from 'next/navigation';
import { BiTrash } from 'react-icons/bi';
import MoreMenu from '@/components/more/MoreMenu';
import { useAppState } from '@/state/AppState';
import { MdOutlineFileDownload } from 'react-icons/md';
import MoreMenuItem from '@/components/more/MoreMenuItem';
import { Video } from '@/db/video_orm';
import { RevalidateMedia } from '@/media';

export default function AdminVideoMenuClient({
  video,
  revalidateVideo,
  includeFavorite = true,
  ...props
}: Omit<ComponentProps<typeof MoreMenu>, 'items'> & {
  video: Video;
  revalidateVideo?: RevalidateMedia;
  includeFavorite?: boolean;
}) {
  const { isUserSignedIn, registerAdminUpdate } = useAppState();

  const isFav = isVideoFav(video);
  const path = usePathname();
  const shouldRedirectFav = isPathFavs(path) && isFav;
  const shouldRedirectDelete = pathForVideo({ video: video.id }) === path;

  const favIconClass = 'translate-x-[-1px] translate-y-[0.5px]';

  const items = useMemo(() => {
    const items: ComponentProps<typeof MoreMenuItem>[] = [
      {
        label: 'Edit',
        icon: <FaRegEdit size={14} />,
        href: pathForAdminVideoEdit(video.id),
      },
    ];
    if (includeFavorite) {
      items.push({
        label: isFav ? 'Unfavorite' : 'Favorite',
        icon: isFav ? (
          <FaStar size={14} className={`text-amber-500 ${favIconClass}`} />
        ) : (
          <FaRegStar size={14} className={favIconClass} />
        ),
        action: () =>
          toggleFavoriteVideoAction(video.id, shouldRedirectFav).then(() =>
            revalidateVideo?.(video.id),
          ),
      });
    }
    items.push(
      {
        label: 'Download',
        icon: (
          <MdOutlineFileDownload size={17} className="translate-x-[-1.5px] translate-y-[-0.5px]" />
        ),
        href: video.url,
        hrefDownloadName: downloadFileNameForVideo(video),
      },
      {
        label: 'Delete',
        icon: <BiTrash size={15} className="translate-x-[-1.5px]" />,
        action: () => {
          return confirm(deleteConfirmationTextForVideo(video))
            ? deleteVideoAction(video.id, video.url, shouldRedirectDelete).then(() => {
                revalidateVideo?.(video.id, true);
                registerAdminUpdate?.();
              })
            : Promise.resolve();
        },
      },
    );
    return items;
  }, [
    video,
    includeFavorite,
    isFav,
    shouldRedirectFav,
    revalidateVideo,
    shouldRedirectDelete,
    registerAdminUpdate,
  ]);

  return isUserSignedIn ? (
    <MoreMenu
      {...{
        items,
        ...props,
      }}
    />
  ) : null;
}
