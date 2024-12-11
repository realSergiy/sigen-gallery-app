'use client';

import { clsx } from 'clsx/lite';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SiteGrid from '../components/SiteGrid';
import ViewSwitcher, { SwitcherSelection } from '@/site/ViewSwitcher';
import {
  PATH_ROOT,
  isPathAdmin,
  isPathFeed,
  isPathGrid,
  isPathProtected,
  isPathSignIn,
} from '@/site/paths';
import AnimateItems from '../components/AnimateItems';
import { useAppState } from '@/state/AppState';
import {
  GRID_HOMEPAGE_ENABLED,
  HAS_DEFINED_SITE_DESCRIPTION,
  SITE_DESCRIPTION,
} from './config';
import AdminAppMenu from '@/admin/AdminAppMenu';

const NAV_HEIGHT_CLASS = HAS_DEFINED_SITE_DESCRIPTION
  ? 'min-h-[4rem] sm:min-h-[5rem]'
  : 'min-h-[4rem]';

export default function Nav({
  siteDomainOrTitle,
}: {
  siteDomainOrTitle: string;
}) {
  const pathname = usePathname();

  const { isUserSignedIn } = useAppState();

  const showNav = !isPathSignIn(pathname);

  const renderLink = (text: string, linkOrAction: string | (() => void)) =>
    typeof linkOrAction === 'string' ? (
      <Link href={linkOrAction}>{text}</Link>
    ) : (
      <button onClick={linkOrAction}>{text}</button>
    );

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === PATH_ROOT) {
      return GRID_HOMEPAGE_ENABLED ? 'grid' : 'feed';
    } else if (isPathGrid(pathname)) {
      return 'grid';
    } else if (isPathFeed(pathname)) {
      return 'feed';
    } else if (isPathProtected(pathname)) {
      return 'admin';
    }
  };

  return (
    <SiteGrid
      contentMain={
        <AnimateItems
          animateOnFirstLoadOnly
          type={!isPathAdmin(pathname) ? 'bottom' : 'none'}
          distanceOffset={10}
          items={
            showNav
              ? [
                  <div
                    key="nav"
                    className={clsx(
                      'flex w-full items-center',
                      NAV_HEIGHT_CLASS,
                    )}
                  >
                    <ViewSwitcher
                      currentSelection={switcherSelectionForPath()}
                      showAdmin={isUserSignedIn}
                    />
                    <div
                      className={clsx(
                        'min-w-0 flex-grow text-right',
                        'hidden xs:block',
                        'translate-y-[-1px]',
                      )}
                    >
                      <div
                        className={clsx(
                          'overflow-hidden truncate',
                          HAS_DEFINED_SITE_DESCRIPTION && 'sm:font-bold',
                        )}
                      >
                        {renderLink(siteDomainOrTitle, PATH_ROOT)}
                      </div>
                      {HAS_DEFINED_SITE_DESCRIPTION && (
                        <div
                          className={clsx(
                            'hidden overflow-hidden truncate sm:block',
                            'leading-tight',
                          )}
                        >
                          {SITE_DESCRIPTION}
                        </div>
                      )}
                    </div>
                  </div>,
                ]
              : []
          }
        />
      }
      contentSide={
        isUserSignedIn && !isPathAdmin(pathname) ? (
          <div
            className={clsx(
              'flex w-full translate-x-[-6px] items-center',
              NAV_HEIGHT_CLASS,
            )}
          >
            <AdminAppMenu />
          </div>
        ) : undefined
      }
      sideHiddenOnMobile
    />
  );
}
