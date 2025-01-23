import EntityLink, { EntityLinkExternalProps } from '@/components/primitives/EntityLink';
import { Fragment } from 'react';
import { pathForTag } from '@/site/paths';
import { formatTag } from '@/tag';
import { PiMaskHappyBold } from 'react-icons/pi';

export default function MasksSwitch({
  tags,
  contrast,
  prefetch,
  className,
}: {
  tags: string[];
  className?: string;
} & EntityLinkExternalProps) {
  return (
    <div className={className}>
      <div className="flex flex-col">
        {tags.map(tag => (
          <Fragment key={tag}>
            <EntityLink
              label={formatTag(tag)}
              href={pathForTag(tag)}
              icon={<PiMaskHappyBold size={18} className="translate-y-px" />}
              contrast={contrast}
              prefetch={prefetch}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
