import EntityLink, { EntityLinkExternalProps } from '@/components/primitives/EntityLink';
import { Fragment } from 'react';
import { pathForTag } from '@/site/paths';
import { formatTag } from '@/tag';
import { PiMaskHappyBold } from 'react-icons/pi';
import { VideoMask } from '@/db/video_orm';

type MasksSwitchProps = {
  masks: VideoMask[];
  className?: string;
} & EntityLinkExternalProps;

export default function MasksSwitch({ masks, contrast, prefetch, className }: MasksSwitchProps) {
  return (
    <div className={className}>
      <div className="flex flex-col">
        {masks.map(({ name }) => (
          <Fragment key={name}>
            <EntityLink
              label={formatTag(name)}
              href={pathForTag(name)}
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
