'use client';

import Switcher from '@/components/Switcher';
import SwitcherItem2 from '@/components/SwitcherItem2';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiMaskHappyBold } from 'react-icons/pi';

const videoUrl =
  'https://8ypnp51mf8nxu2xt.public.blob.vercel-storage.com/video-MxaIck61X8H2b99v.mp4';

const masks = [
  {
    name: 'mask1',
    videoUrl: 'https://8ypnp51mf8nxu2xt.public.blob.vercel-storage.com/video-tIxboLUFoBaetPph.mp4',
    bitmask: 1,
  },
  {
    name: 'mask2',
    videoUrl: 'https://8ypnp51mf8nxu2xt.public.blob.vercel-storage.com/video-WBBYS6WWbi6mgaNE.mp4',
    bitmask: 2,
  },
  {
    name: 'mask3',
    videoUrl: 'https://8ypnp51mf8nxu2xt.public.blob.vercel-storage.com/video-MxaIck61X8H2b99v.mp4',
    bitmask: 3,
  },
  {
    name: 'mask4',
    videoUrl: 'https://example.com/video4.mp4',
    bitmask: 4,
  },
  {
    name: 'mask5',
    videoUrl: 'https://example.com/video5.mp4',
    bitmask: 5,
  },
  {
    name: 'mask6',
    videoUrl: 'https://example.com/video6.mp4',
    bitmask: 6,
  },
  {
    name: 'mask7',
    videoUrl: 'https://example.com/video7.mp4',
    bitmask: 7,
  },
];

type VideoMask = {
  name: string;
  bitmask: number;
  videoUrl: string;
};

export default function VideoPage() {
  const [activeBitmask, setActiveBitmask] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentTimeRef = useRef(0);

  const mask = useMemo(() => masks.find(m => m.bitmask === activeBitmask), [activeBitmask]);

  const onBitmaskChange = useCallback((bitmask: number) => {
    currentTimeRef.current = videoRef.current?.currentTime ?? 0;
    setActiveBitmask(bitmask);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handle = () => {
        videoElement.currentTime = currentTimeRef.current;
      };

      videoElement.addEventListener('loadedmetadata', handle);

      return () => {
        videoElement.removeEventListener('loadedmetadata', handle);
      };
    }
  }, [mask?.videoUrl]);

  return (
    <div>
      <h1>Video Page</h1>
      <p>Video page content</p>
      <MSwitcher masks={masks} setActiveBitmask={onBitmaskChange} />

      <video
        ref={videoRef}
        src={mask ? mask.videoUrl : videoUrl}
        controls
        autoPlay
        muted
        loop
        playsInline
        className="h-full object-cover"
      />
    </div>
  );
}

type MSwitcherProps = {
  className?: string;
  masks: VideoMask[];
  setActiveBitmask: (bitmask: number) => void;
};

const MSwitcher = ({ className, masks, setActiveBitmask }: MSwitcherProps) => {
  const nonCompositeMasks = masks.filter(({ bitmask }) => (bitmask & (bitmask - 1)) === 0);
  const [activeMasks, setActiveMasks] = useState<number[]>([]);

  const toggleActiveMask = (mask: number) => {
    setActiveMasks(prev => (prev.includes(mask) ? prev.filter(m => m !== mask) : [...prev, mask]));
  };

  useEffect(() => {
    setActiveBitmask(activeMasks.reduce((prev, mask) => prev | mask, 0));
  }, [activeMasks, setActiveBitmask]);

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
