import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import IconFeed from '@/site/IconFeed';
import IconGrid from '@/site/IconGrid';
import {
  PATH_ADMIN_VIDEOS,
  PATH_VIDEO_FEED_INFERRED,
  PATH_VIDEO_GRID_INFERRED,
} from '@/site/paths';
import { BiLockAlt } from 'react-icons/bi';
import IconSearch from './IconSearch';
import { useAppState } from '@/state/AppState';
import { GRID_HOMEPAGE_ENABLED } from './config';

export type SwitcherSelection = 'feed' | 'grid' | 'admin';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection;
  showAdmin?: boolean;
}) {
  const { setIsCommandKOpen } = useAppState();

  const renderItemFeed = () => (
    <SwitcherItem
      data-testid="FeedSwitcherItem"
      icon={<IconFeed />}
      href={PATH_VIDEO_FEED_INFERRED}
      active={currentSelection === 'feed'}
      noPadding
    />
  );

  const renderItemGrid = () => (
    <SwitcherItem
      data-testid="GridSwitcherItem"
      icon={<IconGrid />}
      href={PATH_VIDEO_GRID_INFERRED}
      active={currentSelection === 'grid'}
      noPadding
    />
  );

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        {GRID_HOMEPAGE_ENABLED ? renderItemGrid() : renderItemFeed()}
        {GRID_HOMEPAGE_ENABLED ? renderItemFeed() : renderItemGrid()}
        {showAdmin && (
          <SwitcherItem
            data-testid="AdminSwitcherItem"
            icon={<BiLockAlt size={16} className="translate-y-[-0.5px]" />}
            href={PATH_ADMIN_VIDEOS}
            active={currentSelection === 'admin'}
          />
        )}
      </Switcher>
      <Switcher type="borderless">
        <SwitcherItem
          icon={<IconSearch />}
          onClick={() => setIsCommandKOpen?.(true)}
          data-testid="SearchSwitcherItem"
        />
      </Switcher>
    </div>
  );
}
