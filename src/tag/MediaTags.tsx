import EntityLinkTag from '@/tag/EntityLinkTag';
import { isTagFavs } from '.';
import FavsTag from './FavsTag';
import { EntityLinkExternalProps } from '@/components/primitives/EntityLink';
import { Fragment } from 'react';

export default function MediaTags({
  tags,
  contrast,
  prefetch,
}: {
  tags: string[];
} & EntityLinkExternalProps) {
  return (
    <div className="flex flex-col">
      {tags.map(tag => (
        <Fragment key={tag}>
          {isTagFavs(tag) ? (
            <FavsTag {...{ contrast, prefetch }} />
          ) : (
            <EntityLinkTag {...{ tag, contrast, prefetch }} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
