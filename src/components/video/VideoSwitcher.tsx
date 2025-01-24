import { type VideoMask } from '@/db/video_orm';

type VideoWithMasksProps = {
  videoUrl: string;
  masks: VideoMask[];
  enabledBit: number;
  width: number;
  height: number;
};

const constAttributes = {
  controls: true,
  autoPlay: true,
  muted: true,
  loop: true,
  playsInline: true,
};

export default function VideoSwitcher({
  videoUrl,
  masks,
  enabledBit,
  width,
  height,
}: VideoWithMasksProps) {
  const mask = masks.find(mask => mask.bitmask === enabledBit);
  const variableAttributes = {
    width,
    height,
    className: 'object-cover h-full',
  };

  if (mask) {
    return <video {...constAttributes} {...variableAttributes} src={mask.videoUrl} />;
  } else {
    return <video {...constAttributes} {...variableAttributes} src={videoUrl} />;
  }
}
