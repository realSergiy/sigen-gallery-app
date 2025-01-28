import { PiMaskHappyBold } from 'react-icons/pi';
import { VideoMask } from '@/db/video_orm';
import Switcher from '@/components/Switcher';
import SwitcherItem2 from '@/components/SwitcherItem2';
import { useEffect, useState } from 'react';

export type MasksSwitcherProps = {
  className?: string;
  masks: VideoMask[];
  onBitmaskChange: (bitmask: number) => void;
};

const MaskSwitcher = ({
  className,
  masks,
  onBitmaskChange: onBitmaskChange,
}: MasksSwitcherProps) => {
  const nonCompositeMasks = masks.filter(({ bitmask }) => (bitmask & (bitmask - 1)) === 0);
  const [activeMasks, setActiveMasks] = useState<number[]>([]);

  const toggleActiveMask = (mask: number) => {
    setActiveMasks(prev => (prev.includes(mask) ? prev.filter(m => m !== mask) : [...prev, mask]));
  };

  useEffect(() => {
    onBitmaskChange(activeMasks.reduce((prev, mask) => prev | mask, 0));
  }, [activeMasks, onBitmaskChange]);

  return (
    <div className={className}>
      <Switcher type={'borderless'} direction={'vertical'}>
        {nonCompositeMasks.map(mask => (
          <SwitcherItem2
            key={mask.bitmask}
            label={mask.name}
            icon={<PiMaskHappyBold size={18} className="translate-y-px" />}
            onClick={() => toggleActiveMask(mask.bitmask)}
            active={activeMasks.includes(mask.bitmask)}
          />
        ))}
      </Switcher>
    </div>
  );
};

export default MaskSwitcher;
