import { VIDEO_WIDTH_LARGE, VideoProps } from '.';
import VideoWithFallback from './VideoWithFallback';

export default function VidLarge(props: VideoProps) {
  const { aspectRatio, blurCompatibilityMode, ...rest } = props;
  return (
    <VideoWithFallback
      {...{
        ...rest,
        blurCompatibilityLevel: blurCompatibilityMode ? 'high' : 'none',
        width: VIDEO_WIDTH_LARGE,
        height: Math.round(VIDEO_WIDTH_LARGE / aspectRatio),
      }}
    />
  );
}
