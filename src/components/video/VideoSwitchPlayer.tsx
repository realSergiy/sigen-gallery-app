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

export default function VideoSwitchPlayer({
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

  // const playerRef = useRef<VideoPlayerRef>(null);
  // const playbackTimeRef = useRef(0);
  // const videoRef = useRef<HTMLVideoElement>(null);

  // const capturePlaybackTime = useCallback((player: HTMLVideoElement) => {
  //   console.log('capturing time', player.currentTime);
  //   playbackTimeRef.current = player.currentTime;
  // }, []);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.currentTime = playbackTimeRef.current;
  //     console.log('setting time', playbackTimeRef.current);
  //   }
  // }, [enabledBit]);

  // useEffect(() => {
  //   const player = playerRef.current;

  //   if (!player) {
  //     return;
  //   }

  //   const videoElement = player as HTMLVideoElement;
  //   const listener = () => capturePlaybackTime(videoElement);
  //   videoElement.addEventListener('timeupdate', listener);

  //   return () => {
  //     videoElement.removeEventListener('timeupdate', listener);
  //   };
  // });

  return (
    <>
      <video
        //        ref={playerRef}
        {...constAttributes}
        {...variableAttributes}
        src={mask ? mask.videoUrl : videoUrl}
      />{' '}
    </>
  );
}
